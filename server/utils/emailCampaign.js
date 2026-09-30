/**
 * Marketing campaign engine: who a campaign goes to, and the send/retry loop.
 */
import { prisma } from "../config/db.js";
import sendEmail from "./sendEmail.js";
import {
  renderCampaignTemplate,
  withUnsubscribeFooter,
  buildUnsubscribeUrl,
} from "./campaignTemplate.js";

// Emails go out in small chunks with a pause between them so the SMTP
// provider isn't hit with hundreds of connections at once. This is a pace,
// NOT a cap — every recipient is sent to.
const SEND_CHUNK_SIZE = 10;
const CHUNK_DELAY_MS = 1000;
export const MAX_RETRIES = 3;

export const AUDIENCES = ["ALL", "ORDERED", "NOT_ORDERED"];
export const AUDIENCE_LABELS = {
  ALL: "all users",
  ORDERED: "customers who have placed an order",
  NOT_ORDERED: "users who have not placed an order",
};

export const normalizeAudience = (value) =>
  AUDIENCES.includes(value) ? value : "ALL";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Has placed an order" = at least one order that wasn't cancelled (a COD
// order still waiting to be marked paid counts — they did place it).
const NOT_CANCELLED = { status: { not: "CANCELLED" } };

const audienceWhere = (audience) => {
  const base = { isActive: true };
  if (audience === "ORDERED") return { ...base, orders: { some: NOT_CANCELLED } };
  if (audience === "NOT_ORDERED") return { ...base, orders: { none: NOT_CANCELLED } };
  return base;
};

/**
 * Everyone a campaign for this audience should reach: active users with a
 * usable email, minus anyone who has unsubscribed, without duplicates.
 * (Unsubscribes are stored as NewsletterSubscriber rows with isActive false —
 * the same flag the admin's subscriber toggle uses.)
 */
export async function getRecipients(audience = "ALL") {
  const [users, optedOut] = await Promise.all([
    prisma.user.findMany({
      where: audienceWhere(audience),
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.newsletterSubscriber.findMany({
      where: { isActive: false },
      select: { email: true },
    }),
  ]);

  const blocked = new Set(optedOut.map((s) => s.email.trim().toLowerCase()));
  const seen = new Set();
  const recipients = [];

  for (const user of users) {
    const email = user.email?.trim();
    if (!email || !email.includes("@")) continue;
    const key = email.toLowerCase();
    if (blocked.has(key) || seen.has(key)) continue;
    seen.add(key);
    recipients.push({ ...user, email });
  }
  return recipients;
}

export async function getAudienceCounts() {
  const [all, ordered, notOrdered] = await Promise.all(
    AUDIENCES.map((a) => getRecipients(a).then((r) => r.length))
  );
  return { all, ordered, notOrdered };
}

// Send one log row's email and record the outcome. Returns "sent", "failed"
// or "skipped".
async function deliverLog(log, campaign, { isRetry = false } = {}) {
  const retryCount = isRetry ? log.retryCount + 1 : log.retryCount;

  // Checked at send time, not just when the campaign started, so someone who
  // unsubscribes mid-send (or before a retry) isn't emailed afterwards.
  const unsubscribed = await prisma.newsletterSubscriber.findFirst({
    where: { email: { equals: log.email, mode: "insensitive" }, isActive: false },
    select: { id: true },
  });
  if (unsubscribed) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: "Skipped: recipient has unsubscribed",
        retryCount: MAX_RETRIES, // not retryable
      },
    });
    return "skipped";
  }

  let sendError = null;
  try {
    const vars = { name: log.userName, email: log.email, subject: campaign.subject };
    await sendEmail({
      email: log.email,
      subject: renderCampaignTemplate(campaign.subject, vars, { html: false }),
      html: renderCampaignTemplate(withUnsubscribeFooter(campaign.htmlContent), vars),
      headers: { "List-Unsubscribe": `<${buildUnsubscribeUrl(log.email)}>` },
    });
  } catch (error) {
    sendError = error;
  }

  // Recorded outside the try so a database hiccup after a successful send
  // can't be mistaken for a failed send (which a retry would then repeat).
  if (sendError) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: sendError.message || "Unknown error",
        retryCount,
      },
    });
    return "failed";
  }

  await prisma.emailLog.update({
    where: { id: log.id },
    data: { status: "SENT", sentAt: new Date(), retryCount, errorMessage: null },
  });
  return "sent";
}

// Recompute the campaign's totals from its logs. When `finishing`, also
// closes it out: COMPLETED, or FAILED if nothing at all could be delivered.
async function refreshCampaignStats(campaignId, { finishing = false } = {}) {
  const groups = await prisma.emailLog.groupBy({
    by: ["status"],
    where: { campaignId },
    _count: true,
  });
  const count = (status) => groups.find((g) => g.status === status)?._count || 0;
  const sentCount = count("SENT");
  const failedCount = count("FAILED");

  const current = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });
  if (!current) return;

  const data = { sentCount, failedCount };
  if (finishing) {
    data.sentAt = new Date();
  }
  if (finishing || current.status !== "SENDING") {
    // Also covers a retry rescuing a campaign that had ended up FAILED.
    data.status = sentCount === 0 && failedCount > 0 ? "FAILED" : "COMPLETED";
  }
  await prisma.emailCampaign.update({ where: { id: campaignId }, data });
}

// A campaign is only ever processed by one loop at a time.
const activeCampaigns = new Set();

/**
 * Send every PENDING email of a campaign, pausing between chunks, then close
 * the campaign. Safe to call again for the same campaign (it's a no-op while
 * already running, and only ever picks up what is still PENDING).
 */
export async function processCampaign(campaignId) {
  if (activeCampaigns.has(campaignId)) return;
  activeCampaigns.add(campaignId);

  try {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return;

    for (;;) {
      const pending = await prisma.emailLog.findMany({
        where: { campaignId, status: "PENDING" },
        take: SEND_CHUNK_SIZE,
        orderBy: { createdAt: "asc" },
      });
      if (pending.length === 0) break;

      for (const log of pending) {
        await deliverLog(log, campaign);
      }
      await sleep(CHUNK_DELAY_MS);
    }

    await refreshCampaignStats(campaignId, { finishing: true });
  } finally {
    activeCampaigns.delete(campaignId);
  }
}

// Re-send the given FAILED (now RETRYING) log rows.
export async function retryLogs(campaignId, logIds) {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return;

  const logs = await prisma.emailLog.findMany({
    where: { id: { in: logIds }, status: "RETRYING" },
  });

  let sinceLastPause = 0;
  for (const log of logs) {
    await deliverLog(log, campaign, { isRetry: true });
    if (++sinceLastPause >= SEND_CHUNK_SIZE) {
      sinceLastPause = 0;
      await sleep(CHUNK_DELAY_MS);
    }
  }

  await refreshCampaignStats(campaignId);
}

/**
 * Call once at server start. Sending runs inside the server process, so a
 * restart (deploy, crash) mid-campaign would leave it stuck on SENDING with
 * emails still PENDING and nothing to continue them. This picks those up and
 * finishes them.
 */
export async function resumeInterruptedCampaigns() {
  // Nothing is really mid-retry at boot; put those back so Retry can re-run them.
  await prisma.emailLog.updateMany({
    where: { status: "RETRYING" },
    data: { status: "FAILED" },
  });

  const stuck = await prisma.emailCampaign.findMany({
    where: { status: "SENDING" },
    select: { id: true },
  });

  for (const campaign of stuck) {
    console.log(`Resuming interrupted email campaign ${campaign.id}`);
    processCampaign(campaign.id).catch((err) =>
      console.error(`Failed to resume campaign ${campaign.id}:`, err)
    );
  }
}
