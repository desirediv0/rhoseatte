/**
 * Pure helpers for marketing emails: placeholder rendering and signed
 * unsubscribe links. No database or mail dependencies, so they are cheap to
 * test on their own.
 */
import crypto from "crypto";
import { getStoreConfig } from "./storeConfig.js";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

const tokenSecret = () => {
  const secret = process.env.ACCESS_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ACCESS_JWT_SECRET is not set, so unsubscribe links cannot be signed");
  }
  return secret;
};

// The token is an HMAC of the (lowercased) address, so a link can only be
// made by this server and can't be forged to unsubscribe someone else.
export const makeUnsubscribeToken = (email) =>
  crypto
    .createHmac("sha256", tokenSecret())
    .update(String(email).trim().toLowerCase())
    .digest("hex");

export const isValidUnsubscribeToken = (email, token) => {
  if (!email || !token) return false;
  const expected = Buffer.from(makeUnsubscribeToken(email));
  const given = Buffer.from(String(token));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
};

export const buildUnsubscribeUrl = (email) => {
  const base = getStoreConfig().websiteUrl.replace(/\/+$/, "");
  return `${base}/unsubscribe?email=${encodeURIComponent(email)}&token=${makeUnsubscribeToken(email)}`;
};

const UNSUBSCRIBE_PLACEHOLDER = /\{\{\s*UNSUBSCRIBE_URL\s*\}\}/;

// Every marketing email must carry a working unsubscribe link. Templates
// already have one, but a custom HTML body might not — add a small footer in
// that case instead of silently sending without one.
export const withUnsubscribeFooter = (html) => {
  if (UNSUBSCRIBE_PLACEHOLDER.test(html)) return html;
  return (
    html +
    '<div style="text-align:center;font:12px Arial,sans-serif;color:#888;padding:16px;">' +
    "You are receiving this because you have an account with {{STORE_NAME}}. " +
    '<a href="{{UNSUBSCRIBE_URL}}" style="color:#888;">Unsubscribe</a>' +
    "</div>"
  );
};

/**
 * Replace {{STORE_NAME}}, {{USER_NAME}}, {{SUBJECT}}, {{SHOP_URL}} and
 * {{UNSUBSCRIBE_URL}}. Unknown {{...}} tags are left untouched. With
 * html: true (email bodies) every inserted value is HTML-escaped — names come
 * from user sign-ups and must not be able to inject markup into an email.
 * Use html: false for the plain-text subject line.
 */
export const renderCampaignTemplate = (text, { name, email, subject }, { html = true } = {}) => {
  const store = getStoreConfig();
  const esc = html ? escapeHtml : (v) => String(v ?? "");
  const firstName = String(name || "").trim().split(/\s+/)[0] || "there";

  return String(text).replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (match, key) => {
    switch (key) {
      case "STORE_NAME":
        return esc(store.fromName);
      case "USER_NAME":
        return esc(firstName);
      case "SUBJECT":
        return esc(subject);
      case "SHOP_URL":
        return esc(store.websiteUrl);
      case "UNSUBSCRIBE_URL":
        return esc(buildUnsubscribeUrl(email));
      default:
        return match;
    }
  });
};
