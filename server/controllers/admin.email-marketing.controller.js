import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import sendEmail from "../utils/sendEmail.js";
import { getStoreConfig } from "../utils/storeConfig.js";
import { processAndUploadImage } from "../middlewares/multer.middlerware.js";
import { getFileUrl } from "../utils/deleteFromS3.js";
import {
  renderCampaignTemplate,
  withUnsubscribeFooter,
  buildUnsubscribeUrl,
  makeUnsubscribeToken,
} from "../utils/campaignTemplate.js";
import {
  MAX_RETRIES,
  AUDIENCE_LABELS,
  normalizeAudience,
  getRecipients,
  getAudienceCounts,
  processCampaign,
  retryLogs,
} from "../utils/emailCampaign.js";

// Get SMTP settings status
export const getSmtpSettings = asyncHandler(async (req, res, next) => {
  const store = getStoreConfig();
  const smtpConfigured = Boolean(
    process.env.SMTP_USER && (process.env.SMTP_SERVICE || process.env.SMTP_HOST)
  );

  res.status(200).json(
    new ApiResponsive(200, {
      configured: smtpConfigured,
      host: process.env.SMTP_HOST || "",
      port: process.env.SMTP_PORT || "587",
      service: process.env.SMTP_SERVICE || "",
      user: process.env.SMTP_USER || "",
      secure: process.env.SMTP_SECURE || "",
      fromName: store.fromName,
      fromEmail: store.fromEmail,
      storeName: store.storeName,
      storeEmail: store.storeEmail,
    }, "SMTP settings fetched")
  );
});

// Get all campaigns with pagination
export const getCampaigns = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;

  const [campaigns, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
      include: {
        _count: { select: { logs: true } },
        logs: {
          select: { status: true },
        },
      },
    }),
    prisma.emailCampaign.count({ where }),
  ]);

  // Compute status counts for each campaign
  const campaignsWithStats = campaigns.map((c) => {
    const sent = c.logs.filter((l) => l.status === "SENT").length;
    const failed = c.logs.filter((l) => l.status === "FAILED").length;
    const pending = c.logs.filter((l) => l.status === "PENDING").length;
    return {
      id: c.id,
      subject: c.subject,
      status: c.status,
      totalRecipients: c.totalRecipients,
      sentCount: sent,
      failedCount: failed,
      pendingCount: pending,
      createdAt: c.createdAt,
      sentAt: c.sentAt,
    };
  });

  res.status(200).json(
    new ApiResponsive(200, {
      campaigns: campaignsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, "Campaigns fetched successfully")
  );
});

// Get campaign details with logs
export const getCampaignById = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  // Compute stats
  const stats = {
    total: campaign.totalRecipients,
    sent: campaign.logs.filter((l) => l.status === "SENT").length,
    failed: campaign.logs.filter((l) => l.status === "FAILED").length,
    pending: campaign.logs.filter((l) => l.status === "PENDING").length,
    retrying: campaign.logs.filter((l) => l.status === "RETRYING").length,
  };

  res.status(200).json(
    new ApiResponsive(200, { campaign, stats }, "Campaign fetched successfully")
  );
});

// Create a campaign (DRAFT)
export const createCampaign = asyncHandler(async (req, res, next) => {
  const { subject, htmlContent, plainText } = req.body;

  if (!subject || !htmlContent) {
    throw new ApiError(400, "Subject and HTML content are required");
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      htmlContent,
      plainText: plainText || "",
      createdById: req.admin.id,
    },
  });

  res.status(201).json(
    new ApiResponsive(201, { campaign }, "Campaign created successfully")
  );
});

// Update a campaign (DRAFT only)
export const updateCampaign = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;
  const { subject, htmlContent, plainText } = req.body;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status !== "DRAFT") {
    throw new ApiError(400, "Only DRAFT campaigns can be edited");
  }

  const updated = await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      ...(subject && { subject }),
      ...(htmlContent && { htmlContent }),
      ...(plainText !== undefined && { plainText }),
    },
  });

  res.status(200).json(
    new ApiResponsive(200, { campaign: updated }, "Campaign updated successfully")
  );
});

// Delete a campaign
export const deleteCampaign = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status === "SENDING") {
    throw new ApiError(400, "Cannot delete a campaign that is currently sending");
  }

  await prisma.emailCampaign.delete({ where: { id: campaignId } });

  res.status(200).json(
    new ApiResponsive(200, null, "Campaign deleted successfully")
  );
});


// Copy an existing campaign into a fresh DRAFT — this is how the same
// content is sent to a second audience (a campaign can only be sent once).
export const duplicateCampaign = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const source = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!source) {
    throw new ApiError(404, "Campaign not found");
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject: source.subject,
      htmlContent: source.htmlContent,
      plainText: source.plainText || "",
      createdById: req.admin.id,
    },
  });

  res.status(201).json(
    new ApiResponsive(201, { campaign }, "Campaign duplicated as a new draft")
  );
});

// Test email - send to a single address. Rendered exactly like a real send
// (placeholders filled, unsubscribe link real) so what arrives is what
// recipients will see.
export const sendTestEmail = asyncHandler(async (req, res, next) => {
  const { email, subject, htmlContent } = req.body;

  if (!email || !subject || !htmlContent) {
    throw new ApiError(400, "Email, subject, and HTML content are required");
  }

  try {
    const vars = { name: req.admin?.name || "there", email, subject };
    await sendEmail({
      email,
      subject: `[TEST] ${renderCampaignTemplate(subject, vars, { html: false })}`,
      html: renderCampaignTemplate(withUnsubscribeFooter(htmlContent), vars),
      headers: { "List-Unsubscribe": `<${buildUnsubscribeUrl(email)}>` },
    });

    res.status(200).json(
      new ApiResponsive(200, { success: true }, "Test email sent successfully")
    );
  } catch (error) {
    throw new ApiError(500, `Failed to send test email: ${error.message}`);
  }
});

// Send a campaign to an audience: ALL users, ORDERED (placed at least one
// non-cancelled order) or NOT_ORDERED. Reaches every matching recipient —
// there is no cap — minus anyone who has unsubscribed.
export const sendCampaign = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;
  const audience = normalizeAudience(req.body?.audience);

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status !== "DRAFT") {
    throw new ApiError(400, "Only DRAFT campaigns can be sent");
  }

  // Every email carries a signed unsubscribe link; fail now, before anything
  // is queued, if the server can't sign one.
  try {
    makeUnsubscribeToken("check@example.com");
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  const recipients = await getRecipients(audience);

  if (recipients.length === 0) {
    throw new ApiError(400, `No recipients found for ${AUDIENCE_LABELS[audience]}`);
  }

  // Claim the campaign atomically so a double-click can't queue it twice.
  const claimed = await prisma.emailCampaign.updateMany({
    where: { id: campaignId, status: "DRAFT" },
    data: {
      status: "SENDING",
      totalRecipients: recipients.length,
      sentCount: 0,
      failedCount: 0,
    },
  });
  if (claimed.count === 0) {
    throw new ApiError(400, "Only DRAFT campaigns can be sent");
  }

  try {
    await prisma.emailLog.createMany({
      data: recipients.map((user) => ({
        campaignId,
        email: user.email,
        userName: user.name,
        status: "PENDING",
      })),
    });
  } catch (error) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "DRAFT", totalRecipients: 0 },
    });
    throw error;
  }

  // Runs in the background; if the server restarts mid-way it is picked back
  // up on boot (see resumeInterruptedCampaigns).
  processCampaign(campaignId).catch((err) =>
    console.error("Campaign processing error:", err)
  );

  res.status(200).json(
    new ApiResponsive(200, {
      campaignId,
      audience,
      totalRecipients: recipients.length,
      message: `Sending to ${recipients.length} recipient(s) (${AUDIENCE_LABELS[audience]}).`,
    }, "Campaign sending started")
  );
});

// Retry failed emails for a campaign
export const retryFailedEmails = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  // Get failed logs with retry count < MAX_RETRIES
  const failedLogs = await prisma.emailLog.findMany({
    where: {
      campaignId,
      status: "FAILED",
      retryCount: { lt: MAX_RETRIES },
    },
  });

  if (failedLogs.length === 0) {
    throw new ApiError(400, "No failed emails eligible for retry");
  }

  await prisma.emailLog.updateMany({
    where: {
      id: { in: failedLogs.map((l) => l.id) },
    },
    data: { status: "RETRYING" },
  });

  retryLogs(campaignId, failedLogs.map((l) => l.id)).catch((err) =>
    console.error("Retry processing error:", err)
  );

  res.status(200).json(
    new ApiResponsive(200, {
      retryCount: failedLogs.length,
      message: `Retrying ${failedLogs.length} failed emails`,
    }, "Retry started")
  );
});

// Recipient counts per audience, for the send dialog. `count` (= everyone)
// is kept for older callers.
export const getUserCount = asyncHandler(async (req, res, next) => {
  const counts = await getAudienceCounts();

  res.status(200).json(
    new ApiResponsive(200, { count: counts.all, ...counts }, "User count fetched")
  );
});

// Saved (admin-made) templates: reusable starting points for campaigns
export const getEmailTemplates = asyncHandler(async (req, res) => {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res
    .status(200)
    .json(new ApiResponsive(200, { templates }, "Templates fetched successfully"));
});

export const createEmailTemplate = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const subject = String(req.body.subject || "");
  const htmlContent = String(req.body.htmlContent || "");
  if (!name) throw new ApiError(400, "Template name is required");
  if (!htmlContent.trim()) throw new ApiError(400, "Template content is required");

  const template = await prisma.emailTemplate.create({
    data: { name: name.slice(0, 80), subject, htmlContent, createdById: req.admin.id },
  });
  return res
    .status(201)
    .json(new ApiResponsive(201, { template }, "Template saved"));
});

export const deleteEmailTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const existing = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
  if (!existing) throw new ApiError(404, "Template not found");
  await prisma.emailTemplate.delete({ where: { id: templateId } });
  return res.status(200).json(new ApiResponsive(200, null, "Template deleted"));
});

// Upload an image for use inside an email. Returns a public, absolute URL.
const EMAIL_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const EMAIL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const uploadEmailImage = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiError(400, "Please choose an image");
  if (!EMAIL_IMAGE_TYPES.includes(file.mimetype)) {
    throw new ApiError(400, "Only JPG, PNG or GIF images can be used in emails");
  }
  if (file.size > EMAIL_IMAGE_MAX_BYTES) {
    throw new ApiError(400, "Image is too large (max 5 MB)");
  }
  const key = await processAndUploadImage(file, "email-images");
  return res
    .status(201)
    .json(new ApiResponsive(201, { url: getFileUrl(key) }, "Image uploaded"));
});
