"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import { fetchApi } from "./utils";
import { getGuestWishlistIds } from "./guest-wishlist-utils";

/**
 * Live wishlist count for the navbar badge.
 * - Guest: counts localStorage entries, updates on "guest-wishlist-changed".
 * - Logged in: fetches /users/wishlist, refreshes on "wishlist-changed" and
 *   "wishlist-synced" (fired after a guest→account merge on login).
 */
export function useWishlistCount() {
    const { isAuthenticated, loading } = useAuth();
    const [count, setCount] = useState(0);

    const readGuest = useCallback(() => {
        try {
            setCount(getGuestWishlistIds().length);
        } catch {
            setCount(0);
        }
    }, []);

    const readServer = useCallback(async () => {
        try {
            const res = await fetchApi("/users/wishlist", { credentials: "include" });
            setCount(res.data?.wishlistItems?.length || 0);
        } catch {
            // 401 / offline — fall back to whatever is stored locally so the badge
            // still shows something rather than flickering to 0.
            readGuest();
        }
    }, [readGuest]);

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            readGuest();
            const onChange = () => readGuest();
            window.addEventListener("guest-wishlist-changed", onChange);
            window.addEventListener("storage", onChange); // other tabs
            return () => {
                window.removeEventListener("guest-wishlist-changed", onChange);
                window.removeEventListener("storage", onChange);
            };
        }

        readServer();
        const onChange = () => readServer();
        window.addEventListener("wishlist-changed", onChange);
        window.addEventListener("wishlist-synced", onChange);
        return () => {
            window.removeEventListener("wishlist-changed", onChange);
            window.removeEventListener("wishlist-synced", onChange);
        };
    }, [isAuthenticated, loading, readGuest, readServer]);

    return count;
}
