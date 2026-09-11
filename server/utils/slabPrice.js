/**
 * Shared quantity-based pricing-slab lookup, used everywhere an item's
 * effective unit price needs to be computed: cart display, checkout
 * order-create (Razorpay), payment verification, and cash-on-delivery order
 * creation.
 *
 * Previously each of those had its own slightly different copy of this
 * logic, and the Razorpay order-create path was MISSING it entirely — so a
 * variant/product with quantity-based slab pricing configured could show one
 * price in the cart and be charged a different amount at checkout.
 */

/**
 * @param {object} variant - ProductVariant with `pricingSlabs` and `product.pricingSlabs` included.
 * @param {number} quantity
 * @returns {number} effective unit price
 */
export function calculateSlabPrice(variant, quantity) {
  const qty = parseInt(quantity, 10) || 1;

  const findMatch = (slabs) =>
    (slabs || []).find(
      (slab) => qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty)
    );

  // 1. Variant-specific slabs take priority.
  const variantMatch = findMatch(variant?.pricingSlabs);
  if (variantMatch) return parseFloat(variantMatch.price);

  // 2. Product-level slabs.
  const productMatch = findMatch(variant?.product?.pricingSlabs);
  if (productMatch) return parseFloat(productMatch.price);

  // 3. Fallback to the variant's normal sale/regular price.
  return parseFloat(variant?.salePrice || variant?.price || 0);
}

/** Prisma include fragment to attach the slab data calculateSlabPrice needs. */
export const pricingSlabsInclude = {
  pricingSlabs: { orderBy: { minQty: "desc" } },
  product: {
    include: {
      pricingSlabs: { orderBy: { minQty: "desc" } },
    },
  },
};
