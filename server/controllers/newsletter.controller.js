import { prisma } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import sendEmail from "../utils/sendEmail.js";
import { getStoreConfig } from "../utils/storeConfig.js";
import { isValidUnsubscribeToken } from "../utils/campaignTemplate.js";

// Public: Subscribe to newsletter
export const subscribeNewsletter = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    throw new ApiError(400, "Email address is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  // Upsert subscriber (in case they unsubscribed before, reactivate them)
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: normalizedEmail },
    update: {
      isActive: true,
      source: "join_the_cult",
      updatedAt: new Date(),
    },
    create: {
      email: normalizedEmail,
      source: "join_the_cult",
      isActive: true,
    },
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(normalizedEmail).catch((err) => {
    console.error("Newsletter welcome email failed:", err);
  });

  // Notify admin (non-blocking)
  sendAdminNotification(normalizedEmail).catch((err) => {
    console.error("Newsletter admin notification failed:", err);
  });

  res.status(201).json(
    new ApiResponsive(201, { subscriber }, "Welcome to the Cult! You are now subscribed.")
  );
});

// Public: Unsubscribe from marketing emails. Called by the /unsubscribe page
// with the email and signed token from the link in the email; the token
// proves the link came from us, so nobody can unsubscribe someone else.
export const unsubscribeNewsletter = asyncHandler(async (req, res, next) => {
  const { email, token } = req.body;

  if (!email || !token) {
    throw new ApiError(400, "This unsubscribe link is incomplete");
  }

  let valid = false;
  try {
    valid = isValidUnsubscribeToken(email, token);
  } catch (error) {
    console.error("Unsubscribe token check failed:", error.message);
    throw new ApiError(500, "Unsubscribe is temporarily unavailable");
  }
  if (!valid) {
    throw new ApiError(400, "This unsubscribe link is invalid or has expired");
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Same row the newsletter uses: isActive false = no marketing email. Kept
  // for existing subscribers (source untouched); created for account holders
  // who never subscribed so the opt-out is remembered too.
  await prisma.newsletterSubscriber.upsert({
    where: { email: normalizedEmail },
    update: { isActive: false },
    create: { email: normalizedEmail, source: "unsubscribed", isActive: false },
  });

  res.status(200).json(
    new ApiResponsive(200, null, "You have been unsubscribed from marketing emails.")
  );
});

// Admin: Get all newsletter subscribers
export const getNewsletterSubscribers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, search = "", isActive } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true";
  }

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponsive(200, {
      subscribers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, "Subscribers fetched successfully")
  );
});

// Admin: Delete a subscriber
export const deleteNewsletterSubscriber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id },
  });

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  await prisma.newsletterSubscriber.delete({ where: { id } });

  res.status(200).json(
    new ApiResponsive(200, null, "Subscriber removed successfully")
  );
});

// Admin: Toggle subscriber active status
export const toggleSubscriberStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id },
  });

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  const updated = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive: Boolean(isActive) },
  });

  res.status(200).json(
    new ApiResponsive(200, { subscriber: updated }, "Subscriber status updated")
  );
});

// Helper: Send welcome email
async function sendWelcomeEmail(email) {
  const store = getStoreConfig();
  const fromName = store.fromName || "RHOSEATTE";
  const fromEmail = store.fromEmail || "concierge@rhoseatte.com";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e4d5f8; padding: 32px; border-radius: 12px; background: #faf7fd;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4A2478; margin: 0; font-size: 28px; letter-spacing: 0.05em;">RHOSEATTE</h1>
        <p style="color: #B8976A; margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Maison de Parfum</p>
      </div>
      <h2 style="color: #4A2478; font-size: 22px; margin-top: 0;">Welcome to the Cult</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        Thank you for joining our exclusive membership. You will now be the first to know about:
      </p>
      <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
        <li>Limited edition launches</li>
        <li>Secret sample releases</li>
        <li>Private olfactory events & invitations</li>
        <li>Member-only offers</li>
      </ul>
      <p style="font-size: 14px; color: #666; margin-top: 24px;">
        If you did not subscribe, please ignore this email or contact us at ${fromEmail}.
      </p>
      <div style="border-top: 1px solid #e4d5f8; margin-top: 32px; padding-top: 16px; text-align: center; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail({
    email,
    subject: "Welcome to the RHOSEATTE Cult",
    html,
    from: `"${fromName}" <${fromEmail}>`,
  });
}

// Helper: Notify admin
async function sendAdminNotification(email) {
  const adminEmail = process.env.ADMIN_EMAIL || "concierge@rhoseatte.com";
  const store = getStoreConfig();
  const fromName = store.fromName || "RHOSEATTE";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e4d5f8; padding: 24px; border-radius: 12px;">
      <h2 style="color: #4A2478; margin-top: 0;">New Newsletter Subscription</h2>
      <p style="font-size: 15px;"><strong>Email:</strong> ${email}</p>
      <p style="font-size: 15px;"><strong>Source:</strong> Join the Cult (Homepage)</p>
      <p style="font-size: 15px;"><strong>Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
    </div>
  `;

  await sendEmail({
    email: adminEmail,
    subject: "New Cult Member Subscription",
    html,
    from: `"${fromName}" <${process.env.SMTP_USER || adminEmail}>`,
  });
}
