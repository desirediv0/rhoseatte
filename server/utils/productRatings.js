import { prisma } from "../config/db.js";

// Average rating (1 decimal) of APPROVED reviews for a set of products, as a
// Map(productId -> number). Products without approved reviews are absent.
export async function getRatingMap(productIds) {
  const ids = [...new Set((productIds || []).filter(Boolean))];
  if (ids.length === 0) return new Map();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: ids }, status: "APPROVED" },
    _avg: { rating: true },
  });
  return new Map(
    rows.filter((r) => r._avg.rating).map((r) => [r.productId, Number(r._avg.rating.toFixed(1))])
  );
}
