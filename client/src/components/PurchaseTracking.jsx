'use client';

import { useEffect, useRef } from 'react';

export default function PurchaseTracking({ order }) {
  // Guards against firing more than once for the same order — e.g. this
  // component's parent (the checkout success screen) re-renders every second
  // while a redirect countdown ticks, which would otherwise re-run the
  // effect and double-report the same Purchase event to Meta.
  const firedForOrderRef = useRef(null);

  // Depend on primitives, not the `order` object reference, so a fresh
  // object literal from the caller on every render doesn't retrigger this.
  const orderKey = order?.orderNumber || order?.orderId || null;
  const finalAmount = order?.finalAmount;

  useEffect(() => {
    if (!order || !orderKey) return;
    if (firedForOrderRef.current === orderKey) return;

    // Use the final amount actually paid by the customer.
    // If your payment system returns the amount in paise,
    // divide it by 100 before sending to Meta.
    const purchaseValue = Number(finalAmount);

    if (
      purchaseValue > 0 &&
      typeof window !== 'undefined' &&
      typeof window.fbq === 'function'
    ) {
      window.fbq('track', 'Purchase', {
        value: purchaseValue,
        currency: 'INR',
      });
      firedForOrderRef.current = orderKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey, finalAmount]);

  return null;
}
