// Guest Wishlist Utilities
// Wishlist for non-logged-in users, kept in localStorage and merged into the
// server wishlist on login (mirrors the guest-cart flow).

const GUEST_WISHLIST_KEY = "rhoseatte_guest_wishlist";

const read = () => {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const write = (items) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
        // Let the navbar / other tabs update their count.
        window.dispatchEvent(new Event("guest-wishlist-changed"));
    } catch {
        /* ignore quota / private mode errors */
    }
};

// Full list of stored guest wishlist items ({ productId, name, slug, image, price }).
export const getGuestWishlist = () => read();

export const getGuestWishlistIds = () => read().map((i) => i.productId);

export const isInGuestWishlist = (productId) =>
    read().some((i) => i.productId === productId);

// Add a product. `product` needs at least an id; name/slug/image/price are optional.
export const addToGuestWishlist = (product) => {
    if (!product?.id && !product?.productId) return read();
    const productId = product.productId || product.id;
    const items = read();
    if (items.some((i) => i.productId === productId)) return items;
    items.push({
        productId,
        name: product.name || product.productName || "",
        slug: product.slug || product.productSlug || "",
        image:
            product.image ||
            product.images?.find?.((im) => im.isPrimary)?.url ||
            product.images?.[0]?.url ||
            product.images?.[0] ||
            "",
        price:
            product.basePrice ??
            product.price ??
            product.variants?.[0]?.price ??
            null,
        addedAt: Date.now(),
    });
    write(items);
    return items;
};

export const removeFromGuestWishlist = (productId) => {
    const items = read().filter((i) => i.productId !== productId);
    write(items);
    return items;
};

export const toggleGuestWishlist = (product) => {
    const productId = product.productId || product.id;
    if (isInGuestWishlist(productId)) {
        removeFromGuestWishlist(productId);
        return { inWishlist: false };
    }
    addToGuestWishlist(product);
    return { inWishlist: true };
};

export const clearGuestWishlist = () => write([]);

export const hasGuestWishlistItems = () => read().length > 0;

/**
 * Push all guest wishlist items to the server after login, then clear local.
 * `postFn` is a function (path, options) -> promise, i.e. fetchApi.
 */
export const mergeGuestWishlistWithUser = async (postFn) => {
    const items = read();
    if (items.length === 0) return { success: true, merged: 0 };

    // Clear first to avoid a double-merge if this runs twice.
    const toMerge = [...items];
    clearGuestWishlist();

    let merged = 0;
    for (const item of toMerge) {
        try {
            await postFn("/users/wishlist", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ productId: item.productId }),
            });
            merged += 1;
        } catch (err) {
            // 409 = already in wishlist; treat as success, anything else is skipped.
            if (err?.statusCode === 409) merged += 1;
            else console.warn("Wishlist merge skipped for", item.productId, err?.message);
        }
    }

    return { success: true, merged };
};
