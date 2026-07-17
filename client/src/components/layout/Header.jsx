"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn, sortCategories } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import {
  IconSearch,
  IconUser,
  IconShoppingBag,
  IconHeart,
  IconMenu2,
  IconX,
  IconPackage,
  IconLogout,
  IconMapPin,
  IconPhone,
  IconBrandInstagram,
  IconArrowUpRight,
} from "@tabler/icons-react";

const CONTACT = {
  email: "concierge@rhoseatte.com",
  phone: "+91 87964 49692",
  whatsapp: "918796449692",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/bundles", label: "Bundles" },
  { href: "/categories", label: "Collections" },
  { href: "/fragrance-finder", label: "Fragrance Finder" },
  { href: "/about", label: "The Maison" },
  { href: "/contact", label: "Contact" },
];

const ANNOUNCEMENTS = [
  "Complimentary Shipping on Orders Above \u20B99,999",
  "Discover the Nightfall Edition",
  "Handcrafted Luxury Fragrances",
  "Private Consultations Available",
];

function AvatarCircle({ name, size = "sm" }) {
  const dim = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 bg-noir`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories(sortCategories(res.data?.categories || [])))
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const cartCount = getCartItemCount();
  const isHomePage = pathname === "/";
  const overHero = isHomePage && !isScrolled;

  const iconBtn = cn(
    "p-2.5 transition-all duration-300 relative rounded-[6px]",
    overHero
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-noir/70 hover:text-noir hover:bg-noir/5"
  );

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "top-0 left-0 right-0 z-50 w-full transition-all duration-500",
          isHomePage
            ? cn(
                "fixed",
                isScrolled
                  ? "bg-white border-b border-line/60 shadow-sm"
                  : "bg-transparent"
              )
            : "sticky bg-white border-b border-line/60"
        )}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111111",
              color: "#FFFFFF",
              border: "1px solid rgba(184,151,106,0.2)",
              borderRadius: "6px",
              fontSize: "12px",
              letterSpacing: "0.02em",
            },
          }}
        />

        {/* Announcement Bar */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500",
            isHomePage && isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"
          )}
        >
          <div className="bg-noir">
            <div className="py-2.5 px-5 md:px-10 lg:px-20">
              <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
                <div className="hidden md:flex items-center gap-5">
                  <a
                    href="https://www.instagram.com/rhoseatte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-gold-light transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <IconBrandInstagram className="h-4 w-4" stroke={1.5} />
                  </a>
                  <a
                    href="https://www.facebook.com/rhoseatte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-gold-light transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>

                <div className="flex-1 mx-2 md:mx-6 overflow-hidden">
                  <div className="animate-marquee-x whitespace-nowrap text-[10px] tracking-[0.25em] uppercase font-medium text-white/50">
                    {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((txt, i) => (
                      <span key={i} className="mx-6">
                        {txt}
                        <span className="ml-6 text-gold/40">|</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-5 text-[10px] tracking-[0.25em] uppercase font-medium">
                  <Link href="/track-order" className="text-white/40 hover:text-gold-light transition-colors duration-300">
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="transition-all duration-500">
          <div className="px-5 md:px-10 lg:px-20">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between h-[70px] md:h-[85px] lg:h-[100px] gap-6">
              {/* Mobile: Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn("lg:hidden", iconBtn)}
                aria-label="Search"
              >
                <IconSearch className="h-6 w-6" stroke={1.5} />
              </button>

              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="RHOSEATTE"
                    width={140}
                    height={140}
                    className={cn(
                      "h-10 md:h-11 lg:h-12 w-auto object-contain transition-all duration-500",
                      overHero ? "brightness-0 invert" : ""
                    )}
                    priority
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span
                    className={cn(
                      "hidden font-display text-xl md:text-2xl lg:text-[26px] tracking-[0.12em] font-medium transition-all duration-500",
                      overHero ? "text-white" : "text-noir"
                    )}
                  >
                    RHOSEATTE
                  </span>
                </Link>
              </div>

              {/* Desktop: Center Navigation */}
              <nav className="hidden lg:flex items-center justify-center flex-1">
                <div className="flex items-center gap-1">
                  {NAV_LINKS.map(({ href, label }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "relative px-5 py-2.5 text-[16px] tracking-[0.04em] font-medium transition-all duration-300 rounded-[6px]",
                          overHero
                            ? active
                              ? "text-gold-light"
                              : "text-white/90 hover:text-white"
                            : active
                              ? "text-noir"
                              : "text-noir/70 hover:text-noir"
                        )}
                      >
                        {label}
                        <span
                          className={cn(
                            "absolute bottom-1 left-5 right-5 h-px transition-all duration-300",
                            overHero ? "bg-gold-light" : "bg-gold",
                            active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Right: Icons */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={cn("hidden lg:flex", iconBtn)}
                  aria-label="Search"
                >
                  <IconSearch className="h-6 w-6" stroke={1.5} />
                </button>

                <div className="hidden sm:block">
                  <ClientOnly>
                    {isAuthenticated ? (
                      <Link href="/account" className={cn(iconBtn, "hidden lg:flex")} aria-label="Account">
                        <AvatarCircle name={user?.name} size="sm" />
                      </Link>
                    ) : (
                      <Link href="/auth" className={cn(iconBtn, "hidden lg:flex")} aria-label="Login">
                        <IconUser className="h-6 w-6" stroke={1.5} />
                      </Link>
                    )}
                  </ClientOnly>
                </div>

                <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                  <IconHeart className="h-6 w-6" stroke={1.5} />
                </Link>

                <ClientOnly>
                  <Link href="/cart" className={iconBtn} aria-label="Cart">
                    <IconShoppingBag className="h-6 w-6" stroke={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center bg-gold px-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={cn("lg:hidden", iconBtn)}
                  aria-label="Menu"
                >
                  <IconMenu2 className="h-6 w-6" stroke={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchInputRef={searchInputRef}
        categories={categories}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        categories={categories}
        cartCount={cartCount}
        handleLogout={handleLogout}
        pathname={pathname}
      />
    </>
  );
}

function SearchDialog({ open, onOpenChange, searchQuery, setSearchQuery, handleSearch, searchInputRef, categories }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-white p-0 overflow-hidden border border-line/50 shadow-2xl rounded-[8px]">
        <DialogHeader className="px-10 pt-10 pb-2">
          <DialogTitle className="text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone block mb-3 font-medium">
              RHOSEATTE
            </span>
            <span className="font-display text-2xl text-noir">Search the Maison</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-10 pb-10">
          <form onSubmit={handleSearch} className="relative mt-5">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" stroke={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Fragrances, collections, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-10 pr-28 text-[16px] font-light bg-transparent border-b border-line focus:outline-none focus:border-gold transition-all duration-300 placeholder:text-stone/60"
              autoComplete="off"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-stone hover:text-noir transition-colors"
                  aria-label="Clear"
                >
                  <IconX className="h-5 w-5" stroke={1.5} />
                </button>
              )}
              <button
                type="submit"
                className="h-11 px-6 bg-noir text-white text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:bg-gold rounded-[6px]"
              >
                Search
              </button>
            </div>
          </form>

          {categories.length > 0 && (
            <div className="mt-10">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-5 text-stone font-medium">
                Browse Collections
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 text-[11px] tracking-[0.1em] uppercase border border-line rounded-[6px] transition-all duration-300 text-noir/60 hover:border-gold hover:bg-noir hover:text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileMenu({ isOpen, onClose, user, isAuthenticated, categories, cartCount, handleLogout, pathname }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <motion.div
            className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-full max-w-[400px] bg-white shadow-2xl flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-line/60 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="RHOSEATTE"
                width={120}
                height={48}
                className="h-9 w-auto object-contain"
              />
              <button onClick={onClose} className="p-2.5 text-noir/40 hover:text-noir transition-colors" aria-label="Close menu">
                <IconX className="h-6 w-6" stroke={1.5} />
              </button>
            </div>

            {/* User Section */}
            <ClientOnly>
              <div className="px-6 py-6 border-b border-line/60 flex-shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <AvatarCircle name={user?.name} size="lg" />
                    <div className="min-w-0">
                      <p className="font-medium text-[16px] text-noir truncate">{user?.name || "User"}</p>
                      <p className="text-[13px] text-stone truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/auth" className="flex-1" onClick={onClose}>
                      <button className="w-full h-14 text-[12px] uppercase tracking-[0.15em] font-medium text-white bg-noir hover:bg-gold transition-colors rounded-[6px]">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth?tab=register" className="flex-1" onClick={onClose}>
                      <button className="w-full h-14 text-[12px] uppercase tracking-[0.15em] font-medium text-noir border border-line hover:border-noir transition-colors rounded-[6px]">
                        Register
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </ClientOnly>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
              <div className="px-6 py-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-medium mb-4">
                  Navigation
                </p>
                {NAV_LINKS.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between py-4 group",
                        pathname === href ? "text-gold" : "text-noir/70"
                      )}
                    >
                      <span className="text-[18px] tracking-wide font-medium">
                        {label}
                      </span>
                      <IconArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" stroke={1.5} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="px-6 py-6 border-t border-line/60">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-medium mb-4">
                    Collections
                  </p>
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between py-3 text-[15px] text-stone hover:text-noir transition-colors group"
                    >
                      <span className="tracking-wide">{cat.name}</span>
                      <IconArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" stroke={1.5} />
                    </Link>
                  ))}
                </div>
              )}

              {/* Account Links */}
              <ClientOnly>
                {isAuthenticated && (
                  <div className="px-6 py-6 border-t border-line/60">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-medium mb-4">
                      Account
                    </p>
                    {[
                      { href: "/account", icon: IconUser, label: "Profile" },
                      { href: "/account/orders", icon: IconPackage, label: "My Orders" },
                      { href: "/account/addresses", icon: IconMapPin, label: "Addresses" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 text-[15px] text-stone hover:text-noir transition-colors"
                      >
                        <Icon className="h-5 w-5 text-stone/50" stroke={1.5} />
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      className="flex items-center gap-4 w-full py-3 text-[15px] text-red-400 hover:text-red-500 transition-colors"
                    >
                      <IconLogout className="h-5 w-5" stroke={1.5} />
                      Sign Out
                    </button>
                  </div>
                )}
              </ClientOnly>

              {/* Help */}
              <div className="px-6 py-6 border-t border-line/60">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone font-medium mb-4">
                  Help
                </p>
                {[
                  { href: "/fragrance-finder", label: "Fragrance Finder" },
                  { href: "/about", label: "The Maison" },
                  { href: "/contact", label: "Contact" },
                  { href: "/shipping-policy", label: "Shipping Policy" },
                  { href: "/faqs", label: "FAQs" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="block py-3 text-[15px] text-stone hover:text-noir transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Contact */}
              <div className="mx-6 mt-4 mb-8 p-5 bg-ivory rounded-[6px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone mb-3 font-medium">Concierge</p>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center gap-3 text-[15px] text-noir/70 hover:text-gold transition-colors"
                >
                  <IconPhone className="h-5 w-5 flex-shrink-0 text-gold" stroke={1.5} />
                  {CONTACT.phone}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
