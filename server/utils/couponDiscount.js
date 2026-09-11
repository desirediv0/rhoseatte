/**
 * Shared coupon-discount calculation used by /coupons/verify, /coupons/apply,
 * and the payment flow (order create + payment verify).
 *
 * Using one function everywhere guarantees the amount shown to the customer
 * at checkout is exactly the amount charged by Razorpay — previously the
 * payment controller applied a coupon's percentage/fixed discount to the
 * WHOLE cart subtotal, while /coupons/verify (what the customer sees) only
 * discounted the items the coupon actually targets (its products/categories/
 * brands). A coupon scoped to one item could end up discounting the entire
 * order server-side, charging far less than what checkout displayed.
 */

const MAX_DISCOUNT_PERCENT = 95;

/**
 * @param {object} coupon - Prisma Coupon row with `categories`, `products`, `brands` included.
 * @param {Array<{ productId?: string, brandId?: string|null, categoryIds?: string[], price: number|string, quantity?: number }>} items
 * @returns {{ applicableSubtotal: number, matchedItemCount: number, discountAmount: number }}
 */
export function calculateCouponDiscount(coupon, items) {
  const list = Array.isArray(items) ? items : [];

  let subtotal = 0;
  for (const item of list) {
    subtotal += parseFloat(item.price || 0) * (item.quantity || 1);
  }

  let applicableSubtotal = subtotal;
  let matchedItemCount = list.length;

  const hasTargets =
    (coupon.categories && coupon.categories.length) ||
    (coupon.products && coupon.products.length) ||
    (coupon.brands && coupon.brands.length);

  if (hasTargets) {
    const categorySet = new Set((coupon.categories || []).map((c) => c.categoryId));
    const productSet = new Set((coupon.products || []).map((p) => p.productId));
    const brandSet = new Set((coupon.brands || []).map((b) => b.brandId));

    let matchedSubtotal = 0;
    let matched = 0;
    for (const item of list) {
      const price = parseFloat(item.price || 0) * (item.quantity || 1);
      const productMatch = item.productId && productSet.has(item.productId);
      const brandMatch = item.brandId && brandSet.has(item.brandId);
      const categoryMatch = (item.categoryIds || []).some((c) => categorySet.has(c));

      if (productMatch || brandMatch || categoryMatch) {
        matched++;
        matchedSubtotal += price;
      }
    }

    applicableSubtotal = matchedSubtotal;
    matchedItemCount = matched;
  }

  let discountAmount = 0;
  if (applicableSubtotal > 0) {
    if (coupon.discountType === "PERCENTAGE") {
      const cappedPct = Math.min(parseFloat(coupon.discountValue), MAX_DISCOUNT_PERCENT);
      discountAmount = (applicableSubtotal * cappedPct) / 100;
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }
    const maxAllowed = applicableSubtotal * (MAX_DISCOUNT_PERCENT / 100);
    discountAmount = Math.min(discountAmount, maxAllowed);
  }

  return {
    applicableSubtotal,
    matchedItemCount,
    hasTargets: Boolean(hasTargets),
    discountAmount,
  };
}

/**
 * Build the flat item list (productId/brandId/categoryIds/price/quantity) this
 * helper expects, from Prisma cart items with product/variant included.
 */
export function cartItemsToDiscountInput(cartItems) {
  return cartItems.map((item) => {
    const variant = item.productVariant;
    const product = variant?.product;
    const price = parseFloat(variant?.salePrice || variant?.price || 0);
    return {
      productId: product?.id || null,
      brandId: product?.brandId || null,
      categoryIds: (product?.categories || []).map((pc) => pc.categoryId),
      price,
      quantity: item.quantity,
    };
  });
}
