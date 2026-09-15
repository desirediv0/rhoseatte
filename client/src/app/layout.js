import "./globals.css";
import Script from "next/script";
import { Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { AuthModal } from "@/components/ui/AuthModal";
import { Toaster } from "sonner";

// Meta (Facebook) Pixel — set NEXT_PUBLIC_META_PIXEL_ID to override per environment.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2967640223580867";

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
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              style={{ zIndex: 999999 }}
              toastOptions={{
                style: {
                  background: "#111111",
                  color: "#FFFFFF",
                  border: "1px solid rgba(184,151,106,0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  letterSpacing: "0.02em",
                  zIndex: 999999,
                },
              }}
            />
            {/* <SiteFX /> */}
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
