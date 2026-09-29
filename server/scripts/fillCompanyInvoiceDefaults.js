/**
 * One-time fix: if a CompanyInvoiceSettings row already exists (created
 * blank by an earlier invoice download, before this default was added),
 * fill in ONLY the fields that are still empty with the real company
 * details. Never overwrites a value the admin has already set manually.
 *
 * Safe to run multiple times — it's a no-op once everything is filled in.
 *
 * Usage: npm run fill-invoice-defaults   (from server/)
 */
import dotenv from "dotenv";
import { prisma } from "../config/db.js";

dotenv.config();

const DEFAULTS = {
  companyName: "Rhoseatte Fragrances Private Limited",
  addressLine: "132, Ramdaspeth, Nagpur, India",
  gstin: "27AAOCR6143E1Z7",
  email: "admin@rhoseatte.shop",
  phone: "7678336268",
};

async function run() {
  const settings = await prisma.companyInvoiceSettings.findFirst();

  if (!settings) {
    const created = await prisma.companyInvoiceSettings.create({ data: DEFAULTS });
    console.log("No settings row existed — created one with the defaults:", created);
    return;
  }

  const updateData = {};
  for (const [field, value] of Object.entries(DEFAULTS)) {
    if (!settings[field]) {
      updateData[field] = value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    console.log("Every field already has a value — nothing to fill in. Current settings:", settings);
    return;
  }

  const updated = await prisma.companyInvoiceSettings.update({
    where: { id: settings.id },
    data: updateData,
  });
  console.log("Filled in blank fields:", updateData);
  console.log("Updated settings:", updated);
}

run()
  .catch((err) => {
    console.error("Failed to fill invoice defaults:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
