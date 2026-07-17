import "./globals.css";
import { Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import SiteFX from "@/components/ui/SiteFX";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "RHOSEATTE — Luxury Perfume Maison",
  description: "Discover RHOSEATTE — a luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship. Explore our curated collections of niche perfumes.",
  keywords: "RHOSEATTE, luxury perfume, niche fragrance, perfume maison, premium fragrances, velvet allure, noir petals, nightfall edition, luxury scents, artisan perfumery",
  authors: [{ name: "RHOSEATTE" }],
  openGraph: {
    title: "RHOSEATTE — Luxury Perfume Maison",
    description: "A luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship.",
    type: "website",
    locale: "en_IN",
    siteName: "RHOSEATTE",
  },
  twitter: {
    card: "summary_large_image",
    title: "RHOSEATTE — Luxury Perfume Maison",
    description: "A luxury perfume house creating exquisite fragrances that blend timeless elegance with modern craftsmanship.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteFX />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
