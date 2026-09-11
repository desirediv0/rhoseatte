import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import { getFromName, getFromEmail } from "./storeConfig.js";

const sendEmail = async (options) => {
  try {
    let transporter;

    const hasSmtpCreds = Boolean(
      process.env.SMTP_USER &&
      (process.env.SMTP_SERVICE || process.env.SMTP_HOST)
    );

    if (!hasSmtpCreds && process.env.NODE_ENV !== "production") {
      // Dev fallback: use Ethereal test account if SMTP is not configured
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.warn(
        "Using Ethereal test SMTP account for emails. Preview URLs will be logged."
      );
    } else {
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE
        ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
        : port === 465; // 465 is implicit TLS

      const transportConfig = process.env.SMTP_SERVICE
        ? {
          service: process.env.SMTP_SERVICE,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
        : {
          host: process.env.SMTP_HOST,
          port,
          secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        };

      transporter = nodemailer.createTransport(transportConfig);

      if (process.env.NODE_ENV !== "production") {
        try {
          await transporter.verify();
        } catch (verifyError) {
          console.error(
            "SMTP verification failed:",
            verifyError?.message || verifyError
          );
          throw new ApiError(500, "Email service not configured correctly");
        }
      }
    }

    const fromName = getFromName();
    const fromEmail = getFromEmail();
    const fromAddress = `${fromName} <${fromEmail}>`;

    // While testing, EMAIL_OVERRIDE_TO redirects every outgoing email (order
    // confirmations, shipping updates, admin alerts, everything) to one inbox
    // so real customer addresses never receive test traffic. Remove the env
    // var once you're ready for emails to go to their real recipients.
    const overrideTo = process.env.EMAIL_OVERRIDE_TO;
    const actualTo = overrideTo || options.email;
    const subject =
      overrideTo && overrideTo !== options.email
        ? `[to: ${options.email}] ${options.subject}`
        : options.subject;

    const mailOptions = {
      from: fromAddress,
      to: actualTo,
      subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    // Log preview URL for Ethereal in dev
    if (process.env.NODE_ENV !== "production" && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("Email preview URL:", previewUrl);
      }
    }

    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

export default sendEmail;
