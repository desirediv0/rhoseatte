/**
 * First-party invoice PDF generator.
 *
 * Unlike the courier "invoice" buttons (which are really just Shiprocket's
 * own invoice API or Delhivery's packing-slip PDF, and only work once an
 * order has been synced to that courier), this works for ANY order
 * regardless of courier-sync state, and never shows an itemized tax line —
 * only amount paid, discount, and totals.
 */

import PDFDocument from "pdfkit";
import { prisma } from "../config/db.js";

/**
 * Get company invoice header settings (get-or-create singleton, same
 * pattern as getShiprocketSettings/getDelhiverySettings). Every field is
 * optional — a blank settings row is fine, the invoice just omits that
 * block.
 */
export async function getCompanyInvoiceSettings() {
    let settings = await prisma.companyInvoiceSettings.findFirst();

    if (!settings) {
        settings = await prisma.companyInvoiceSettings.create({ data: {} });
    }

    return settings;
}

const formatCurrency = (value) => `Rs. ${parseFloat(value || 0).toFixed(2)}`;

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

/**
 * Resolve a display name/sku for an order item — prefers the immutable
 * productSnapshot (accurate even if the product was later renamed/deleted),
 * falling back to the live product/variant relations for older rows that
 * predate productSnapshot.
 */
function itemDisplay(item) {
    const snap = item.productSnapshot || {};
    return {
        name: snap.name || item.product?.name || "Item",
        sku: snap.sku || item.variant?.sku || "",
    };
}

/**
 * Draw the invoice onto a pdfkit document. Shared by both the single-invoice
 * stream and the bulk-buffer path below.
 */
function drawInvoice(doc, order, companySettings) {
    const invoiceNumber = `${companySettings.invoicePrefix || "INV"}-${order.orderNumber}`;

    // Header — company block only if any field is actually filled in.
    const hasCompanyInfo =
        companySettings.companyName || companySettings.addressLine || companySettings.gstin;

    if (hasCompanyInfo) {
        if (companySettings.companyName) {
            doc.fontSize(16).font("Helvetica-Bold").text(companySettings.companyName);
        }
        doc.fontSize(9).font("Helvetica").fillColor("#555555");
        if (companySettings.addressLine) doc.text(companySettings.addressLine);
        if (companySettings.gstin) doc.text(`GSTIN: ${companySettings.gstin}`);
        doc.moveDown(0.5);
    }

    doc.fillColor("#000000").fontSize(18).font("Helvetica-Bold").text("INVOICE", { align: "right" });
    doc.fontSize(10).font("Helvetica").text(`Invoice #: ${invoiceNumber}`, { align: "right" });
    doc.text(`Order #: ${order.orderNumber}`, { align: "right" });
    doc.text(`Date: ${formatDate(order.createdAt)}`, { align: "right" });
    doc.moveDown(1);

    // Bill-to
    doc.fontSize(11).font("Helvetica-Bold").text("Bill To");
    doc.fontSize(10).font("Helvetica");
    doc.text(order.shippingAddress?.name || order.user?.name || "Customer");
    if (order.user?.email) doc.text(order.user.email);
    if (order.shippingAddress?.phone || order.user?.phone) {
        doc.text(order.shippingAddress?.phone || order.user?.phone);
    }
    if (order.shippingAddress) {
        const addr = order.shippingAddress;
        doc.text(
            [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
                .filter(Boolean)
                .join(", ")
        );
    }
    doc.moveDown(1);

    // Items table
    const tableTop = doc.y;
    const col = { item: 40, qty: 300, price: 370, total: 460 };

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Item", col.item, tableTop);
    doc.text("Qty", col.qty, tableTop);
    doc.text("Price", col.price, tableTop);
    doc.text("Amount", col.total, tableTop);
    doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).strokeColor("#CCCCCC").stroke();

    let y = tableTop + 22;
    doc.font("Helvetica").fontSize(10);
    for (const item of order.items || []) {
        const { name, sku } = itemDisplay(item);
        const label = sku ? `${name} (${sku})` : name;
        const lineTotal = parseFloat(item.subtotal ?? item.price * item.quantity);

        doc.text(label, col.item, y, { width: col.qty - col.item - 10 });
        doc.text(String(item.quantity), col.qty, y);
        doc.text(formatCurrency(item.price), col.price, y);
        doc.text(formatCurrency(lineTotal), col.total, y);
        y += 20;
    }

    doc.moveTo(40, y).lineTo(555, y).strokeColor("#CCCCCC").stroke();
    y += 15;

    // Summary — amount paid + discount only, no tax line.
    const summaryX = 370;
    const printSummaryRow = (label, value, opts = {}) => {
        doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(opts.bold ? 12 : 10);
        doc.text(label, summaryX, y, { width: 90 });
        doc.text(value, col.total, y);
        y += opts.bold ? 22 : 18;
    };

    printSummaryRow("Subtotal", formatCurrency(order.subTotal));

    const discount = parseFloat(order.discount || 0);
    if (discount > 0) {
        const discountLabel = order.couponCode ? `Discount (${order.couponCode})` : "Discount";
        printSummaryRow(discountLabel, `-${formatCurrency(discount)}`);
    }

    const shippingCost = parseFloat(order.shippingCost || 0);
    if (shippingCost > 0) {
        printSummaryRow("Shipping", formatCurrency(shippingCost));
    }

    const codCharge = parseFloat(order.codCharge || 0);
    if (codCharge > 0) {
        printSummaryRow("COD Charge", formatCurrency(codCharge));
    }

    y += 4;
    doc.moveTo(summaryX, y).lineTo(555, y).strokeColor("#000000").stroke();
    y += 8;
    printSummaryRow("Amount Paid", formatCurrency(order.total), { bold: true });

    y += 15;
    doc.font("Helvetica").fontSize(9).fillColor("#555555");
    const paymentLabel = order.paymentMethod === "CASH" ? "Cash on Delivery (COD)" : "Prepaid (Online)";
    doc.text(`Payment Method: ${paymentLabel}`, 40, y);
    doc.text(`Order Status: ${order.status}`, 40, y + 14);

    doc.moveDown(2);
    doc.fontSize(8).fillColor("#999999").text(
        "This is a computer-generated invoice.",
        40,
        doc.y,
        { align: "center", width: 515 }
    );
}

/**
 * Stream a single order's invoice PDF directly to an Express response.
 */
export async function streamInvoicePdf(order, res) {
    const companySettings = await getCompanyInvoiceSettings();
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice-${order.orderNumber}.pdf"`
    );

    doc.pipe(res);
    drawInvoice(doc, order, companySettings);
    doc.end();
}

/**
 * Build a single order's invoice PDF as a Buffer — used for bulk/zip
 * download where each invoice needs to be added as a file entry rather than
 * streamed directly to the response.
 */
export async function buildInvoiceBuffer(order, companySettings) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        drawInvoice(doc, order, companySettings);
        doc.end();
    });
}
