import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Resource, Action } from "@/types/admin";
import { emailMarketing, products as productsApi } from "@/api/adminService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import JoditEditor from "jodit-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  HelpCircle,
  Mail,
  Copy,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  Users,
  Server,
  ServerCrash,
  FileText,
  ArrowLeft,
  TestTube,
  RefreshCw,
} from "lucide-react";

type View = "list" | "create" | "edit" | "detail";
type Audience = "ALL" | "ORDERED" | "NOT_ORDERED";

interface SmtpSettings {
  configured: boolean;
  host: string;
  port: string;
  service: string;
  user: string;
  secure: string;
  fromName: string;
  fromEmail: string;
  storeName: string;
  storeEmail: string;
}

interface Campaign {
  id: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount?: number;
  createdAt: string;
  sentAt?: string;
  htmlContent?: string;
  logs?: EmailLog[];
}

interface EmailLog {
  id: string;
  email: string;
  userName?: string;
  status: string;
  errorMessage?: string;
  retryCount: number;
  sentAt?: string;
}

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #FAFBF9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,62,41,0.08); border: 1px solid #E5E7EB; }
    .header { background: linear-gradient(135deg, #002216, #003E29); color: #ffffff; text-align: center; padding: 40px; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
    .content { padding: 40px; }
    .content h2 { color: #002216; font-size: 22px; margin-top: 0; }
    .content p { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 20px; }
    .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #003E29, #005a3c); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; }
    .footer { text-align: center; padding: 28px 30px; font-size: 12px; color: #9ca3af; background: #FAFBF9; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{STORE_NAME}}</h1>
    </div>
    <div class="content">
      <h2>{{SUBJECT}}</h2>
      <p>Hi {{USER_NAME}},</p>
      <p>Write your marketing message here...</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{SHOP_URL}}" target="_blank" style="display:inline-block;padding:15px 40px;background-color:#003E29;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;font-family:Arial,Helvetica,sans-serif;">Shop Now</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 {{STORE_NAME}}. All rights reserved.<br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

const WELCOME_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #FAFBF9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,62,41,0.08); border: 1px solid #E5E7EB; }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffffff; text-align: center; padding: 40px; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
    .accent { display: inline-block; background: rgba(212,175,55,0.2); color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 16px; border: 1px solid rgba(212,175,55,0.3); }
    .content { padding: 40px; }
    .content h2 { color: #1a1a2e; font-size: 22px; margin-top: 0; }
    .content p { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 20px; }
    .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #D4AF37, #C5A028); color: #1a1a2e !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; }
    .benefits { background: #f8f9fa; padding: 24px; border-radius: 12px; margin: 24px 0; }
    .benefits li { margin-bottom: 8px; font-size: 14px; color: #374151; }
    .benefits li:before { content: '\\2713'; color: #D4AF37; font-weight: bold; margin-right: 8px; }
    .footer { text-align: center; padding: 28px 30px; font-size: 12px; color: #9ca3af; background: #FAFBF9; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="accent">Welcome</div>
      <h1>{{STORE_NAME}}</h1>
    </div>
    <div class="content">
      <h2>Welcome to {{STORE_NAME}}, {{USER_NAME}}! 🎉</h2>
      <p>We're thrilled to have you join our family! You've just unlocked access to exclusive collections, premium handcrafted products, and member-only offers.</p>
      <ul class="benefits">
        <li>Exclusive member-only discounts</li>
        <li>Early access to new arrivals</li>
        <li>Free shipping on your first order</li>
        <li>Priority customer support</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{SHOP_URL}}" target="_blank" style="display:inline-block;padding:15px 40px;background-color:#D4AF37;color:#1a1a2e;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;font-family:Arial,Helvetica,sans-serif;">Start Shopping</a>
      </div>
      <p style="font-size: 13px; color: #9ca3af; text-align: center;">Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
    </div>
    <div class="footer">
      &copy; 2026 {{STORE_NAME}}. All rights reserved.<br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

const SALE_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #FAFBF9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,62,41,0.08); border: 1px solid #E5E7EB; }
    .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: #ffffff; text-align: center; padding: 40px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 900; }
    .badge { display: inline-block; background: #FBBF24; color: #1a1a2e; font-size: 13px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 20px; border-radius: 20px; margin-bottom: 16px; }
    .content { padding: 40px; }
    .content h2 { color: #dc2626; font-size: 24px; margin-top: 0; text-align: center; }
    .content p { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 20px; }
    .discount-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px dashed #F59E0B; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
    .discount-code { font-size: 32px; font-weight: 900; color: #dc2626; letter-spacing: 0.1em; }
    .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; }
    .timer { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 16px; }
    .footer { text-align: center; padding: 28px 30px; font-size: 12px; color: #9ca3af; background: #FAFBF9; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Limited Time Offer</div>
      <h1>🔥 SALE IS LIVE!</h1>
    </div>
    <div class="content">
      <h2>Up to 50% Off Everything!</h2>
      <p>Hi {{USER_NAME}},</p>
      <p>Our biggest sale of the season is here! Don't miss out on incredible deals across our entire collection. Premium products at unbeatable prices.</p>
      <div class="discount-box">
        <p style="margin-bottom: 8px; font-size: 14px; color: #92400e;">Use code at checkout</p>
        <div class="discount-code">SALE50</div>
        <p style="margin-top: 8px; font-size: 13px; color: #92400e;">50% off on all products</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{SHOP_URL}}" target="_blank" style="display:inline-block;padding:15px 40px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;font-family:Arial,Helvetica,sans-serif;">Shop the Sale</a>
      </div>
      <p class="timer">Hurry! Sale ends in 48 hours.</p>
    </div>
    <div class="footer">
      &copy; 2026 {{STORE_NAME}}. All rights reserved.<br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

const NEWSLETTER_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #FAFBF9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,62,41,0.08); border: 1px solid #E5E7EB; }
    .header { background: linear-gradient(135deg, #0f766e, #115e59); color: #ffffff; text-align: center; padding: 40px; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
    .content { padding: 40px; }
    .content h2 { color: #0f766e; font-size: 22px; margin-top: 0; }
    .content p { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 20px; }
    .highlight { background: #f0fdfa; border-left: 4px solid #0f766e; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .highlight p { margin: 0; color: #065f46; font-size: 14px; }
    .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #0f766e, #115e59); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; }
    .footer { text-align: center; padding: 28px 30px; font-size: 12px; color: #9ca3af; background: #FAFBF9; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{STORE_NAME}}</h1>
    </div>
    <div class="content">
      <h2>{{SUBJECT}}</h2>
      <p>Hi {{USER_NAME}},</p>
      <p>Here's what's new at {{STORE_NAME}} this week:</p>
      <div class="highlight">
        <p><strong>✨ New Arrivals:</strong> Check out our latest handcrafted collection featuring premium designs.</p>
      </div>
      <div class="highlight">
        <p><strong>📖 Behind the Scenes:</strong> Learn the story behind our most popular pieces.</p>
      </div>
      <div class="highlight">
        <p><strong>🎁 Special Offer:</strong> Enjoy free shipping on orders over ₹999 this week only.</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{SHOP_URL}}" target="_blank" style="display:inline-block;padding:15px 40px;background-color:#0f766e;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;font-family:Arial,Helvetica,sans-serif;">Read More</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 {{STORE_NAME}}. All rights reserved.<br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

interface EasyProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price?: number; // price customers pay
  mrp?: number; // struck-through price when the product is on sale
}

interface EasyFields {
  products: EasyProduct[];
  heading: string;
  message: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  color: string;
}

const DEFAULT_EASY: EasyFields = {
  products: [],
  heading: "",
  message: "<p>Write your message here...</p>",
  imageUrl: "",
  buttonText: "Shop Now",
  buttonLink: "",
  color: "#003E29",
};

const EASY_COLORS = [
  { name: "Green", value: "#003E29" },
  { name: "Red", value: "#dc2626" },
  { name: "Teal", value: "#0f766e" },
  { name: "Gold", value: "#B8860B" },
  { name: "Black", value: "#111827" },
];

const escHtml = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Mail clients ignore most editor formatting unless it is inline, so give every
// element the editor can produce (headings, lists, tables, quotes, links) an explicit style.
const inlineMessageStyles = (html: string, color: string) => {
  const heading = (size: number) =>
    `font-size:${size}px;font-weight:700;line-height:1.3;color:#111827;margin:0 0 12px;`;
  const styles: Record<string, string> = {
    h1: heading(28),
    h2: heading(24),
    h3: heading(20),
    h4: heading(18),
    h5: heading(16),
    h6: heading(14),
    p: "margin:0 0 14px;",
    ul: "margin:0 0 14px;padding-left:22px;",
    ol: "margin:0 0 14px;padding-left:22px;",
    li: "margin:0 0 6px;",
    blockquote: `border-left:4px solid ${color};margin:0 0 14px;padding:4px 16px;color:#6b7280;`,
    table: "border-collapse:collapse;width:100%;margin:0 0 14px;",
    td: "border:1px solid #d1d5db;padding:8px;",
    th: "border:1px solid #d1d5db;padding:8px;background-color:#f3f4f6;",
    a: `color:${color};text-decoration:underline;`,
  };
  return html.replace(/<(h[1-6]|p|ul|ol|li|blockquote|table|td|th|a)(\s[^>]*)?>/gi, (_m, tag, attrs = "") => {
    const base = styles[tag.toLowerCase()];
    if (/\sstyle="/i.test(attrs)) {
      // our defaults first, the editor's own style after it so the user's choice wins
      return `<${tag}${attrs.replace(/\sstyle="/i, ` style="${base}`)}>`;
    }
    return `<${tag}${attrs} style="${base}">`;
  });
};

const toEasyProduct = (p: any): EasyProduct => {
  const variants: any[] = Array.isArray(p.variants) ? p.variants : [];
  const pays = variants
    .map((v) => Number(v.salePrice ?? v.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  const price = pays.length ? Math.min(...pays) : undefined;
  const cheapest = variants.find((v) => Number(v.salePrice ?? v.price) === price);
  const list = cheapest ? Number(cheapest.price) : undefined;
  const image =
    p.images?.find((i: any) => i.isPrimary)?.url ||
    p.images?.[0]?.url ||
    variants.find((v) => v.images?.[0]?.url)?.images[0].url ||
    "";
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image,
    price,
    mrp: price !== undefined && list !== undefined && list > price ? list : undefined,
  };
};

const formatRupees = (n: number) => "&#8377;" + n.toLocaleString("en-IN");

// Two products per row, each with image, name, price and a View button (all inline-styled).
const buildProductsHtml = (items: EasyProduct[], color: string) => {
  if (!items.length) return "";
  const card = (p: EasyProduct) => {
    const url = escHtml(`{{SHOP_URL}}/products/${p.slug}`);
    const price =
      p.price !== undefined
        ? `<div style="font-size:15px;font-weight:700;color:#111827;margin:0 0 10px;">${formatRupees(p.price)}${
            p.mrp ? ` <span style="font-size:13px;font-weight:400;color:#9ca3af;text-decoration:line-through;">${formatRupees(p.mrp)}</span>` : ""
          }</div>`
        : "";
    return `<td width="50%" valign="top" style="padding:8px;text-align:center;">
        ${p.image ? `<a href="${url}" target="_blank"><img src="${escHtml(p.image)}" alt="${escHtml(p.name)}" width="240" style="display:block;width:100%;max-width:240px;height:auto;border:0;border-radius:12px;margin:0 auto 10px;"></a>` : ""}
        <div style="font-size:14px;font-weight:600;color:#111827;margin:0 0 4px;">${escHtml(p.name)}</div>
        ${price}
        <a href="${url}" target="_blank" style="display:inline-block;padding:9px 22px;background-color:${color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;font-family:Arial,Helvetica,sans-serif;">View</a>
      </td>`;
  };
  const rows: string[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    rows.push(`<tr>${pair.map(card).join("")}${pair.length === 1 ? '<td width="50%"></td>' : ""}</tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rows.join("")}</table>`;
};

// Builds a complete, email-client-safe HTML email (all styles inline) from the simple form fields.
const buildEasyHtml = (e: EasyFields) => {
  const link = e.buttonLink.trim() || "{{SHOP_URL}}";
  // The message comes from the rich-text editor, so it is already HTML.
  const message = inlineMessageStyles(e.message, e.color);
  const heading = e.heading.trim() ? escHtml(e.heading.trim()) : "{{SUBJECT}}";
  const image = e.imageUrl.trim()
    ? `<img src="${escHtml(e.imageUrl.trim())}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`
    : "";
  const productsHtml = buildProductsHtml(e.products || [], e.color);
  const button = e.buttonText.trim()
    ? `<div style="text-align:center;margin:32px 0;"><a href="${escHtml(link)}" target="_blank" style="display:inline-block;padding:15px 40px;background-color:${e.color};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;font-family:Arial,Helvetica,sans-serif;">${escHtml(e.buttonText.trim())}</a></div>`
    : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>p{margin:0 0 14px;} ul,ol{margin:0 0 14px;padding-left:22px;} img{max-width:100%;height:auto;}</style>
</head>
<body style="margin:0;padding:0;background-color:#FAFBF9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background-color:${e.color};color:#ffffff;text-align:center;padding:32px;">
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;">{{STORE_NAME}}</h1>
    </div>
    ${image}
    <div style="padding:40px;">
      <h2 style="color:${e.color};font-size:22px;margin-top:0;">${heading}</h2>
      <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 20px;">Hi {{USER_NAME}},</p>
      <div style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 20px;">${message}</div>
      ${productsHtml}
      ${button}
    </div>
    <div style="text-align:center;padding:28px 30px;font-size:12px;color:#9ca3af;background:#FAFBF9;border-top:1px solid #E5E7EB;">
      &copy; 2026 {{STORE_NAME}}. All rights reserved.<br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
};

// Rich-text editor for the email message: only email-safe formatting tools.
const MESSAGE_EDITOR_CONFIG = {
  height: 300,
  placeholder: "Write your message... (use the toolbar for bold, colours, lists, links, images)",
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: "insert_as_html" as const,
  enter: "p" as const,
  spellcheck: true,
  buttons: [
    "paragraph", "|",
    "bold", "italic", "underline", "strikethrough", "|",
    "font", "fontsize", "brush", "|",
    "align", "ul", "ol", "outdent", "indent", "|",
    "link", "image", "table", "hr", "symbol", "|",
    "copyformat", "eraser", "undo", "redo", "|",
    "source", "fullsize",
  ],
};

const TEMPLATES = [
  { id: "blank", name: "Blank Template", subject: "", html: DEFAULT_TEMPLATE },
  { id: "welcome", name: "Welcome New User", subject: "Welcome to {{STORE_NAME}} - 10% Off Inside!", html: WELCOME_TEMPLATE },
  { id: "sale", name: "Sale / Discount", subject: "🔥 Up to 50% Off - Limited Time Only!", html: SALE_TEMPLATE },
  { id: "newsletter", name: "Newsletter", subject: "Your Weekly Update from {{STORE_NAME}}", html: NEWSLETTER_TEMPLATE },
];

export default function EmailMarketingPage() {
  const { admin } = useAuth();
  const [view, setView] = useState<View>("list");
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  // How many people each audience would reach (unsubscribed users excluded).
  const [audienceCounts, setAudienceCounts] = useState({ all: 0, ordered: 0, notOrdered: 0 });
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Send dialog: which campaign it is open for, and who it goes to.
  const [sendTarget, setSendTarget] = useState<string | null>(null);
  const [audience, setAudience] = useState<Audience>("ALL");
  const [sending, setSending] = useState(false);

  // Form state
  const [formSubject, setFormSubject] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerResults, setPickerResults] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [easyMode, setEasyMode] = useState(true);
  const [easy, setEasy] = useState<EasyFields>(DEFAULT_EASY);
  const [formHtml, setFormHtml] = useState(() => buildEasyHtml(DEFAULT_EASY));
  const [formEditId, setFormEditId] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<
    { id: string; name: string; subject: string; htmlContent: string }[]
  >([]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await emailMarketing.getTemplates();
      if (res.data.success) setSavedTemplates(res.data.data.templates);
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  }, []);

  useEffect(() => {
    if (view === "create" || view === "edit") loadTemplates();
  }, [view, loadTemplates]);

  const handleSaveTemplate = async () => {
    if (!formHtml.trim()) {
      toast.error("Template content is empty");
      return;
    }
    const name = window.prompt("Template name (e.g. Diwali Offer)");
    if (!name || !name.trim()) return;
    try {
      await emailMarketing.createTemplate({
        name: name.trim(),
        subject: formSubject,
        htmlContent: formHtml,
      });
      toast.success("Template saved. Find it under 'My Templates'");
      loadTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Delete template "${name}"? Campaigns already made from it are not affected.`)) return;
    try {
      await emailMarketing.deleteTemplate(id);
      toast.success("Template deleted");
      loadTemplates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete template");
    }
  };

  const hasPermission =
    admin?.role === "SUPER_ADMIN" ||
    admin?.permissions?.includes(`${Resource.SETTINGS}:${Action.CREATE}`) ||
    admin?.permissions?.includes(`${Resource.SETTINGS}:${Action.UPDATE}`);

  // Load SMTP settings
  useEffect(() => {
    const loadSmtp = async () => {
      try {
        const res = await emailMarketing.getSmtpSettings();
        if (res.data.success) {
          setSmtpSettings(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load SMTP settings", err);
      }
    };
    loadSmtp();
  }, []);

  // Load campaigns. `silent` refreshes in place (no spinner) for auto-refresh.
  const loadCampaigns = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await emailMarketing.getCampaigns();
      if (res.data.success) {
        setCampaigns(res.data.data.campaigns);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "list") loadCampaigns();
  }, [view, loadCampaigns]);

  // Keep the list's sent/failed counts moving while a campaign is sending.
  const anySending = campaigns.some((c) => c.status === "SENDING");
  useEffect(() => {
    if (view !== "list" || !anySending) return;
    const timer = setInterval(() => loadCampaigns(true), 5000);
    return () => clearInterval(timer);
  }, [view, anySending, loadCampaigns]);

  // Recipient counts per audience
  const loadAudienceCounts = useCallback(async () => {
    try {
      const res = await emailMarketing.getUserCount();
      if (res.data.success) {
        const { all, ordered, notOrdered } = res.data.data;
        setAudienceCounts({ all: all ?? 0, ordered: ordered ?? 0, notOrdered: notOrdered ?? 0 });
      }
    } catch (err) {
      console.error("Failed to load recipient counts", err);
    }
  }, []);

  useEffect(() => {
    loadAudienceCounts();
  }, [loadAudienceCounts]);

  // The campaign row only gets its totals when sending finishes, so live
  // progress comes from the per-email stats the detail endpoint returns.
  const toCampaignView = (data: any): Campaign => ({
    ...data.campaign,
    sentCount: data.stats.sent,
    failedCount: data.stats.failed,
    pendingCount: data.stats.pending + data.stats.retrying,
  });

  // Load campaign detail
  const loadCampaignDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await emailMarketing.getCampaignById(id);
      if (res.data.success) {
        setSelectedCampaign(toCampaignView(res.data.data));
        setView("detail");
      }
    } catch (err) {
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh an open campaign while it is still sending.
  const openId = selectedCampaign?.id;
  const openStatus = selectedCampaign?.status;
  useEffect(() => {
    if (view !== "detail" || !openId || openStatus !== "SENDING") return;
    const timer = setInterval(async () => {
      try {
        const res = await emailMarketing.getCampaignById(openId);
        if (res.data.success) setSelectedCampaign(toCampaignView(res.data.data));
      } catch {
        /* next tick will retry */
      }
    }, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, openId, openStatus]);

  // Save campaign
  const handleSaveCampaign = async () => {
    if (!formSubject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!formHtml.trim()) {
      toast.error("HTML content is required");
      return;
    }

    try {
      setLoading(true);
      if (formEditId) {
        await emailMarketing.updateCampaign(formEditId, {
          subject: formSubject,
          htmlContent: formHtml,
        });
        toast.success("Campaign updated successfully");
      } else {
        await emailMarketing.createCampaign({
          subject: formSubject,
          htmlContent: formHtml,
        });
        toast.success("Campaign created successfully");
      }
      setView("list");
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await emailMarketing.deleteCampaign(id);
      toast.success("Campaign deleted");
      loadCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete campaign");
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Enter an email address to test");
      return;
    }
    try {
      setSendingTest(true);
      await emailMarketing.sendTestEmail({
        email: testEmail,
        subject: formSubject || "Test Email",
        htmlContent: formHtml,
      });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  // Send campaign: opens the audience dialog (nothing is sent until confirmed)
  const handleSendCampaign = (id: string) => {
    setAudience("ALL");
    setSendTarget(id);
    loadAudienceCounts(); // fresh numbers, not whatever they were at page load
  };

  const confirmSend = async () => {
    if (!sendTarget) return;
    const id = sendTarget;
    try {
      setSending(true);
      const res = await emailMarketing.sendCampaign(id, { audience });
      toast.success(res.data.data.message);
      setSendTarget(null);
      loadCampaignDetail(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  // A campaign can only be sent once — duplicate it to send the same
  // content to another audience.
  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await emailMarketing.duplicateCampaign(id);
      toast.success("Duplicated as a new draft — send it to a different audience");
      setView("list");
      loadCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to duplicate campaign");
    } finally {
      setLoading(false);
    }
  };

  // Retry failed
  const handleRetryFailed = async (id: string) => {
    try {
      setLoading(true);
      const res = await emailMarketing.retryFailedEmails(id);
      toast.success(res.data.data.message);
      loadCampaignDetail(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "No failed emails to retry");
    } finally {
      setLoading(false);
    }
  };

  // Product picker: search the catalogue (debounced) while the dialog is open
  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setPickerLoading(true);
        const res = await productsApi.getProducts({ page: 1, limit: 12, search: pickerSearch.trim() });
        if (!cancelled && res.data.success) setPickerResults(res.data.data?.products || []);
      } catch (err) {
        if (!cancelled) toast.error("Could not load products");
      } finally {
        if (!cancelled) setPickerLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickerOpen, pickerSearch]);

  const toggleProduct = (p: any) => {
    const selected = easy.products.some((x) => x.id === p.id);
    updateEasy({
      products: selected ? easy.products.filter((x) => x.id !== p.id) : [...easy.products, toEasyProduct(p)],
    });
  };

  const messageEditorConfig = useMemo(() => MESSAGE_EDITOR_CONFIG, []);

  const updateEasy = (patch: Partial<EasyFields>) => {
    const next = { ...easy, ...patch };
    setEasy(next);
    setFormHtml(buildEasyHtml(next));
  };

  const resetForm = () => {
    setFormSubject("");
    setEasy(DEFAULT_EASY);
    setEasyMode(true);
    setFormHtml(buildEasyHtml(DEFAULT_EASY));
    setFormEditId(null);
    setTestEmail("");
  };

  const startEdit = (campaign: Campaign) => {
    setFormSubject(campaign.subject);
    setFormHtml(campaign.htmlContent || "");
    setEasyMode(false);
    setFormEditId(campaign.id);
    setView("edit");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-700";
      case "SENDING": return "bg-blue-100 text-blue-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "FAILED": return "bg-red-100 text-red-700";
      case "SENT": return "bg-green-100 text-green-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "RETRYING": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <Card className="bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800">You don't have permission to access Email Marketing.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== "list" && (
            <Button variant="ghost" size="icon" onClick={() => { setView("list"); resetForm(); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" /> Email Marketing
            </h1>
            <p className="text-muted-foreground text-sm">Send marketing emails to your users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-4 w-4 mr-2" /> How it works
          </Button>
          {view === "list" && (
            <Button onClick={() => { resetForm(); setView("create"); }}>
              <Plus className="h-4 w-4 mr-2" /> New Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Product picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add products to the email</DialogTitle>
            <DialogDescription>Search and click products to add or remove them.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Search products..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <div className="space-y-2">
            {pickerLoading && pickerResults.length === 0 ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : pickerResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No products found</p>
            ) : (
              pickerResults.map((p) => {
                const chosen = easy.products.some((x) => x.id === p.id);
                const preview = toEasyProduct(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p)}
                    className={`flex w-full items-center gap-3 rounded-md border-2 p-2 text-left ${
                      chosen ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {preview.image ? (
                      <img src={preview.image} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                    {preview.price !== undefined && (
                      <span className="text-sm text-muted-foreground">₹{preview.price.toLocaleString("en-IN")}</span>
                    )}
                    {chosen && <CheckCircle className="h-4 w-4 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setPickerOpen(false)}>Done ({easy.products.length} selected)</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* How it works */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> How Email Marketing works
            </DialogTitle>
            <DialogDescription>
              Send an email to your customers in 4 simple steps. No coding needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <section>
              <h3 className="font-semibold mb-1">1. Write your email</h3>
              <p className="text-muted-foreground">
                Click <b>New Campaign</b>. In the <b>Easy Editor</b> fill in the Heading, and write your
                Message in the editor (bold, colours, lists, links and images are in the toolbar). Add
                products with <b>Add Products</b> (photo, name, price and link are added for you), and a
                Button text and Button link if you want a button. Leave the link empty to send customers
                to your shop. Pick a Colour. The <b>Preview</b> shows exactly how it will look.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-1">2. Add a subject and save</h3>
              <p className="text-muted-foreground">
                The subject is the line people see in their inbox. Click <b>Save as Draft</b>. To reuse the
                design later, click <b>Save as Template</b>, give it a name, and it will appear under{" "}
                <b>My Templates</b>. Ready-made designs (Welcome, Sale, Newsletter) are at the top.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-1">3. Send a test to yourself</h3>
              <p className="text-muted-foreground">
                Enter your own email and click <b>Send Test</b>. Open it in your inbox and click the button
                to check that the link works. Always do this before sending to customers.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-1">4. Send to customers</h3>
              <p className="text-muted-foreground mb-2">Click <b>Send</b> on the campaign and choose who gets it:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><b>All customers</b></li>
                <li><b>Customers who have ordered</b> (cancelled orders do not count)</li>
                <li><b>Customers who have not ordered yet</b></li>
              </ul>
              <p className="text-muted-foreground mt-2">
                To email both groups with the same design, send once, then click <b>Duplicate</b> and send
                the copy to the other group. A campaign can only be sent once, so check the number of
                customers shown before confirming.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-1">Good to know</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  Each customer's name is added automatically ({"{{USER_NAME}}"}). You can also type{" "}
                  {"{{USER_NAME}}"} inside your message.
                </li>
                <li>Every email has an Unsubscribe link. People who unsubscribe are never emailed again.</li>
                <li>Emails are sent in small batches, so a big list can take a few minutes. Progress updates on this page.</li>
                <li>If some emails fail, open the campaign and click <b>Retry</b>.</li>
                <li>Use full links that start with <b>https://</b> (for example https://rhoseatte.com).</li>
              </ul>
            </section>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowHelp(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMTP Settings Card */}
      {view === "list" && smtpSettings && (
        <Card className={smtpSettings.configured ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {smtpSettings.configured ? (
                  <Server className="h-5 w-5 text-green-600" />
                ) : (
                  <ServerCrash className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${smtpSettings.configured ? "text-green-800" : "text-red-800"}`}>
                    SMTP: {smtpSettings.configured ? "Configured" : "Not Configured"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {smtpSettings.configured
                      ? `${smtpSettings.service || smtpSettings.host}:${smtpSettings.port} | From: ${smtpSettings.fromEmail}`
                      : "Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" /> {audienceCounts.all} users
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {audienceCounts.ordered} ordered
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign List View */}
      {view === "list" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No campaigns yet</p>
                <p className="text-muted-foreground text-sm">Create your first email campaign to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{campaign.subject}</h3>
                          <Badge className={`text-xs ${statusColor(campaign.status)}`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {campaign.sentAt && ` | Sent: ${new Date(campaign.sentAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                        {campaign.status !== "DRAFT" && (
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className="text-green-600">✓ {campaign.sentCount} sent</span>
                            <span className="text-red-600">✗ {campaign.failedCount} failed</span>
                            <span className="text-gray-500">→ {campaign.totalRecipients} total</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => loadCampaignDetail(campaign.id)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicate(campaign.id)} disabled={loading} title="Duplicate as a new draft">
                          <Copy className="h-4 w-4" />
                        </Button>
                        {campaign.status === "DRAFT" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => startEdit(campaign)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSendCampaign(campaign.id)} disabled={loading}>
                              <Send className="h-4 w-4 mr-1" /> Send
                            </Button>
                          </>
                        )}
                        {campaign.status !== "SENDING" && (
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit View */}
      {(view === "create" || view === "edit") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {formEditId ? "Edit Campaign" : "New Campaign"}
                </h2>

                <div className="space-y-2">
                    <Label>Choose Template</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setFormSubject(tpl.subject);
                            setFormHtml(tpl.html);
                            setEasyMode(false);
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                            formHtml === tpl.html
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium text-xs">{tpl.name}</p>
                        </button>
                      ))}
                    </div>
                    {savedTemplates.length > 0 && (
                      <>
                        <Label className="block pt-2">My Templates</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {savedTemplates.map((tpl) => (
                            <div
                              key={tpl.id}
                              className={`relative rounded-lg border-2 transition-all ${
                                formHtml === tpl.htmlContent
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormSubject(tpl.subject);
                                  setFormHtml(tpl.htmlContent);
                                  setEasyMode(false);
                                }}
                                className="w-full p-3 pr-8 text-left"
                              >
                                <p className="font-medium text-xs truncate">{tpl.name}</p>
                              </button>
                              <button
                                type="button"
                                title="Delete template"
                                onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    placeholder="Enter email subject..."
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={easyMode ? "default" : "outline"}
                    onClick={() => {
                      setEasyMode(true);
                      setFormHtml(buildEasyHtml(easy));
                    }}
                  >
                    Easy Editor
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!easyMode ? "default" : "outline"}
                    onClick={() => setEasyMode(false)}
                  >
                    HTML (advanced)
                  </Button>
                </div>

                {easyMode ? (
                  <div className="space-y-4 rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Fill the boxes, the email is made for you (see Preview on the right). Each customer's name is added automatically.
                    </p>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        placeholder="e.g. Big Diwali Sale"
                        value={easy.heading}
                        onChange={(e) => updateEasy({ heading: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <div className="border rounded-md overflow-hidden">
                        <JoditEditor
                          value={easy.message}
                          config={messageEditorConfig}
                          onChange={(content: string) => updateEasy({ message: content })}
                          onBlur={(content: string) => updateEasy({ message: content })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tip: you can type {"{{USER_NAME}}"} anywhere to add the customer's name.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Image link (optional)</Label>
                      <Input
                        placeholder="https://... (link of a banner image)"
                        value={easy.imageUrl}
                        onChange={(e) => updateEasy({ imageUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Products (optional)</Label>
                      <p className="text-xs text-muted-foreground">
                        Shows each product with its photo, name, price and a View button linking to your shop.
                      </p>
                      {easy.products.length > 0 && (
                        <div className="space-y-2">
                          {easy.products.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 rounded-md border p-2">
                              {p.image ? (
                                <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100" />
                              )}
                              <span className="flex-1 truncate text-sm">{p.name}</span>
                              {p.price !== undefined && (
                                <span className="text-sm text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => updateEasy({ products: easy.products.filter((x) => x.id !== p.id) })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Products
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button text (empty = no button)</Label>
                        <Input
                          placeholder="Shop Now"
                          value={easy.buttonText}
                          onChange={(e) => updateEasy({ buttonText: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button link (empty = your shop)</Label>
                        <Input
                          placeholder="https://rhoseatte.com/..."
                          value={easy.buttonLink}
                          onChange={(e) => updateEasy({ buttonLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Colour</Label>
                      <div className="flex gap-2">
                        {EASY_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.name}
                            onClick={() => updateEasy({ color: c.value })}
                            style={{ backgroundColor: c.value }}
                            className={`h-8 w-8 rounded-full border-2 ${
                              easy.color === c.value ? "border-primary ring-2 ring-primary/30" : "border-white"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>HTML Content</Label>
                    <p className="text-xs text-muted-foreground">
                      Use placeholders: {"{{STORE_NAME}}"}, {"{{USER_NAME}}"}, {"{{SUBJECT}}"}, {"{{SHOP_URL}}"}, {"{{UNSUBSCRIBE_URL}}"}
                    </p>
                    <Textarea
                      className="font-mono text-xs min-h-[500px]"
                      value={formHtml}
                      onChange={(e) => setFormHtml(e.target.value)}
                      placeholder="HTML email content..."
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSaveCampaign} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {formEditId ? "Update Campaign" : "Save as Draft"}
                  </Button>
                  <Button variant="outline" onClick={handleSaveTemplate} disabled={loading}>
                    Save as Template
                  </Button>
                  <Button variant="outline" onClick={() => { setView("list"); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Preview
                </h3>
                <div
                  className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: formHtml
                      // Same brand name the real email uses (server-side fromName)
                      .replace(/\{\{STORE_NAME\}\}/g, smtpSettings?.fromName || smtpSettings?.storeName || "Your Store")
                      .replace(/\{\{USER_NAME\}\}/g, "Customer")
                      .replace(/\{\{SUBJECT\}\}/g, formSubject || "Your Subject")
                      .replace(/\{\{SHOP_URL\}\}/g, "#")
                      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, "#"),
                  }}
                />
              </CardContent>
            </Card>

            {/* Test Email */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TestTube className="h-4 w-4" /> Send Test Email
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sent exactly as recipients will see it (name, store and unsubscribe link filled in). Always test before sending.
                </p>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSendTest}
                  disabled={sendingTest || !smtpSettings?.configured}
                >
                  {sendingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Test
                </Button>
                {!smtpSettings?.configured && (
                  <p className="text-xs text-red-500">Configure SMTP in .env first</p>
                )}
              </CardContent>
            </Card>

            {/* Batch Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">How sending works</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• You pick the audience when you press Send</li>
                  <li>• Everyone in that audience gets it — no cap</li>
                  <li>• Users who unsubscribed are skipped automatically</li>
                  <li>• Failed emails can be retried (up to 3 times)</li>
                  <li>• If the server restarts mid-send, it carries on by itself</li>
                  <li>• Reach now: {audienceCounts.all} users, {audienceCounts.ordered} have ordered, {audienceCounts.notOrdered} have not</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && selectedCampaign && (
        <div className="space-y-4">
          {/* Campaign Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{selectedCampaign.totalRecipients}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{selectedCampaign.sentCount || 0}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{selectedCampaign.failedCount || 0}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className={statusColor(selectedCampaign.status)}>
                  {selectedCampaign.status}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {selectedCampaign.status === "DRAFT" && (
              <Button onClick={() => handleSendCampaign(selectedCampaign.id)} disabled={loading}>
                <Send className="h-4 w-4 mr-2" /> Send Campaign
              </Button>
            )}
            <Button variant="outline" onClick={() => handleDuplicate(selectedCampaign.id)} disabled={loading}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
            {selectedCampaign.failedCount > 0 && (
              <Button variant="outline" onClick={() => handleRetryFailed(selectedCampaign.id)} disabled={loading}>
                <RotateCcw className="h-4 w-4 mr-2" /> Retry Failed ({selectedCampaign.failedCount})
              </Button>
            )}
            <Button variant="outline" onClick={() => { loadCampaignDetail(selectedCampaign.id); }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          {selectedCampaign.status === "SENDING" && (
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending… {(selectedCampaign.sentCount || 0) + (selectedCampaign.failedCount || 0)} of{" "}
              {selectedCampaign.totalRecipients} done. This page updates by itself.
            </p>
          )}

          {/* Email Logs */}
          {selectedCampaign.logs && selectedCampaign.logs.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Delivery Status</h3>
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b text-left">
                        <th className="py-2 font-medium">Email</th>
                        <th className="py-2 font-medium">Name</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 font-medium">Retries</th>
                        <th className="py-2 font-medium">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaign.logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{log.email}</td>
                          <td className="py-2 text-muted-foreground">{log.userName || "-"}</td>
                          <td className="py-2">
                            <Badge className={`text-xs ${statusColor(log.status)}`}>
                              {log.status === "SENT" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {log.status === "FAILED" && <XCircle className="h-3 w-3 mr-1" />}
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-2 text-center">{log.retryCount}</td>
                          <td className="py-2 text-xs text-red-500 max-w-[200px] truncate">
                            {log.errorMessage || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Who should this go to? Nothing is sent until "Send" is pressed here. */}
      <Dialog open={!!sendTarget} onOpenChange={(open) => { if (!open && !sending) setSendTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send campaign</DialogTitle>
            <DialogDescription>
              Choose who receives it. Users who have unsubscribed are always skipped. A campaign can be sent only
              once — to reach another audience with the same email, duplicate it afterwards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {([
              { value: "ALL", label: "All users", hint: "Everyone with an account", count: audienceCounts.all },
              { value: "ORDERED", label: "Customers who ordered", hint: "Placed at least one order that wasn't cancelled", count: audienceCounts.ordered },
              { value: "NOT_ORDERED", label: "Haven't ordered yet", hint: "Have an account but no order", count: audienceCounts.notOrdered },
            ] as { value: Audience; label: string; hint: string; count: number }[]).map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  audience === option.value ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="campaign-audience"
                    className="mt-1"
                    checked={audience === option.value}
                    onChange={() => setAudience(option.value)}
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                </span>
                <Badge variant="outline" className="shrink-0">{option.count}</Badge>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSendTarget(null)} disabled={sending}>
              Cancel
            </Button>
            <Button
              onClick={confirmSend}
              disabled={sending || (audience === "ALL" ? audienceCounts.all : audience === "ORDERED" ? audienceCounts.ordered : audienceCounts.notOrdered) === 0}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send to {audience === "ALL" ? audienceCounts.all : audience === "ORDERED" ? audienceCounts.ordered : audienceCounts.notOrdered} people
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
