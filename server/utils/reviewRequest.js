import { prisma } from "../config/db.js";
import sendEmail from "./sendEmail.js";
import { getStoreConfig } from "./storeConfig.js";
import { getFileUrl } from "./deleteFromS3.js";
import { getReviewRequestTemplate } from "../email/temp/EmailTemplate.js";

/**
 * Email a customer links to review the products of a delivered order.
 *
 * Idempotent: the first caller atomically claims `reviewRequestSentAt`, so the
 * several code paths that can mark an order delivered (admin, Shiprocket,
 * Delhivery, tracking) never cause more than one email. Products the customer
 * has already reviewed are left out. `force` re-sends on admin request.
 *
 * Returns { sent: boolean, reason?: string }. Never throws.
 */
export async function sendReviewRequestForOrder(orderId, { force = false } = {}) {
  let claimed = false;
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { productId: true } },
        orderBundles: { select: { bundleCampaignId: true, bundleName: true, selectedProducts: true } },
      },
    });
    if (!order) return { sent: false, reason: "Order not found" };
    if (order.status !== "DELIVERED") return { sent: false, reason: "Order is not delivered" };
    if (!order.user?.email) return { sent: false, reason: "Customer has no email" };
    if (order.reviewRequestSentAt && !force) return { sent: false, reason: "Already sent" };

    // Claim (skipped on a forced re-send)
    if (!force) {
      const claim = await prisma.order.updateMany({
        where: { id: orderId, reviewRequestSentAt: null },
        data: { reviewRequestSentAt: new Date() },
      });
      if (claim.count === 0) return { sent: false, reason: "Already sent" };
      claimed = true;
    }

    // Products that only came inside a bundle are reviewed through the bundle,
    // not one by one. A product also bought on its own (more order rows than
    // bundle appearances) still gets its own link.
    const bundleProductCount = new Map();
    for (const b of order.orderBundles) {
      const sel = Array.isArray(b.selectedProducts) ? b.selectedProducts : [];
      for (const s of sel) {
        if (s?.productId) bundleProductCount.set(s.productId, (bundleProductCount.get(s.productId) || 0) + 1);
      }
    }
    const rowCount = new Map();
    for (const i of order.items) {
      if (i.productId) rowCount.set(i.productId, (rowCount.get(i.productId) || 0) + 1);
    }
    const productIds = [...rowCount.keys()].filter(
      (id) => rowCount.get(id) > (bundleProductCount.get(id) || 0)
    );
    const alreadyReviewed = await prisma.review.findMany({
      where: { userId: order.user.id, productId: { in: productIds } },
      select: { productId: true },
    });
    const reviewedSet = new Set(alreadyReviewed.map((r) => r.productId));
    const toReview = productIds.filter((id) => !reviewedSet.has(id));

    // Bundles in this order that the customer has not reviewed yet
    const bundleIds = [...new Set(order.orderBundles.map((b) => b.bundleCampaignId).filter(Boolean))];
    const reviewedBundles = bundleIds.length
      ? await prisma.review.findMany({
          where: { userId: order.user.id, bundleCampaignId: { in: bundleIds } },
          select: { bundleCampaignId: true },
        })
      : [];
    const reviewedBundleSet = new Set(reviewedBundles.map((r) => r.bundleCampaignId));
    const bundlesToReview = bundleIds.length
      ? await prisma.bundleCampaign.findMany({
          where: { id: { in: bundleIds.filter((id) => !reviewedBundleSet.has(id)) } },
          select: { title: true, slug: true, banner: true },
        })
      : [];

    if (toReview.length === 0 && bundlesToReview.length === 0) {
      return { sent: false, reason: "All products already reviewed" };
    }

    const products = await prisma.product.findMany({
      where: { id: { in: toReview } },
      select: {
        name: true,
        slug: true,
        images: { orderBy: { order: "asc" }, take: 3, select: { url: true, isPrimary: true } },
      },
    });
    const emailProducts = [
      ...bundlesToReview.map((b) => ({
        name: b.title,
        path: `/bundles/${b.slug}`,
        image: b.banner ? getFileUrl(b.banner) : null,
      })),
      ...products.map((p) => {
        const img = p.images.find((i) => i.isPrimary) || p.images[0];
        return { name: p.name, path: `/products/${p.slug}`, image: img ? getFileUrl(img.url) : null };
      }),
    ];

    const store = getStoreConfig();
    await sendEmail({
      email: order.user.email,
      subject: `How was your order #${order.orderNumber}? Share your review`,
      html: getReviewRequestTemplate(
        {
          userName: (order.user.name || "").split(" ")[0] || "there",
          orderNumber: order.orderNumber,
          products: emailProducts,
        },
        store
      ),
    });

    if (force) {
      await prisma.order.update({ where: { id: orderId }, data: { reviewRequestSentAt: new Date() } });
    }
    return { sent: true };
  } catch (error) {
    console.error(`Review request email failed for order ${orderId}:`, error.message);
    // Release the claim so the next delivered-trigger (or a manual send) can retry
    if (claimed) {
      await prisma.order
        .update({ where: { id: orderId }, data: { reviewRequestSentAt: null } })
        .catch(() => {});
    }
    return { sent: false, reason: error.message };
  }
}

// Fire-and-forget wrapper for use inside request handlers
export function queueReviewRequest(orderId) {
  sendReviewRequestForOrder(orderId).catch(() => {});
}
