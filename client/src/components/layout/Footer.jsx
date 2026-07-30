"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconArrowUpRight,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
} from "@tabler/icons-react";

const WHATSAPP_NUMBER = "917678336268";

export const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories((res.data?.categories || []).slice(0, 6)))
      .catch(console.error);
  }, []);

  const shopLinks = categories.length > 0
    ? [
      ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
      { label: "Secret Collection", href: "/secret-collection" },
    ]
    : [
      { label: "Fragrances", href: "/products" },
      { label: "Collections", href: "/categories" },
      { label: "Nightfall Edition", href: "/products" },
      { label: "Gift Sets", href: "/products" },
      { label: "Secret Collection", href: "/secret-collection" },
    ];



  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#0B0B0B" }}>


      {/* Main Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-10 pt-16 md:pt-20 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="RHOSEATTE"
                width={110}
                height={40}
                className="h-8 w-auto brightness-0 invert opacity-80"
              />
            </Link>
            <p className="text-[13px] leading-relaxed mb-8 max-w-[240px] font-light" style={{ color: "rgba(255,255,255,0.35)" }}>
              A luxury perfume maison crafting exquisite fragrances that blend timeless elegance with modern artistry.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/rhoseatte"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B8976A"; e.currentTarget.style.color = "#B8976A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <IconBrandInstagram className="h-4 w-4" stroke={1.5} />
              </a>
              <a
                href="https://www.facebook.com/rhoseatte"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B8976A"; e.currentTarget.style.color = "#B8976A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <IconBrandFacebook className="h-4 w-4" stroke={1.5} />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B8976A"; e.currentTarget.style.color = "#B8976A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <IconBrandWhatsapp className="h-4 w-4" stroke={1.5} />
              </a>
            </div>
          </div>

          {/* Collections (Dynamic) */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "#B8976A" }}>
              Collections
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] font-light transition-colors duration-300 hover:text-white flex items-center gap-2 group capitalize"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span
                      className="block h-px w-0 group-hover:w-3 transition-all duration-300"
                      style={{ backgroundColor: "#B8976A" }}
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "#B8976A" }}>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About / Our Story", href: "/about" },
                { label: "Journal", href: "/blog" },
                { label: "Fragrance Finder", href: "/fragrance-finder" },
                { label: "Corporate Gifting", href: "/corporate-gifting", highlighted: true },
                { label: "Custom Perfume", href: "/custom-perfume", highlighted: true },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href, highlighted }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className={`text-[13px] font-light transition-all duration-300 flex items-center gap-2 group ${highlighted
                      ? "px-2.5 py-1 rounded border border-[#B8976A] text-[#B8976A] hover:bg-[#B8976A] hover:text-noir font-medium"
                      : "hover:text-white"
                      }`}
                    style={highlighted ? {} : { color: "rgba(255,255,255,0.4)" }}
                  >
                    {!highlighted && (
                      <span
                        className="block h-px w-0 group-hover:w-3 transition-all duration-300"
                        style={{ backgroundColor: "#B8976A" }}
                      />
                    )}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "#B8976A" }}>
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Return Policy", href: "/return-policy" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "FAQ", href: "/faqs" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] font-light transition-colors duration-300 hover:text-white flex items-center gap-2 group"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span
                      className="block h-px w-0 group-hover:w-3 transition-all duration-300"
                      style={{ backgroundColor: "#B8976A" }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: "#B8976A" }}>
              Contact
            </h4>
            <div className="space-y-4">
              <a
                href="tel:+917678336268"
                className="flex items-center gap-3 text-[13px] font-light transition-colors duration-300 hover:text-white group"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <IconPhone className="h-4 w-4 flex-shrink-0" style={{ color: "#B8976A" }} stroke={1.5} />
                <span>+91 76783 36268</span>
              </a>
              <a
                href="mailto:admin@rhoseatte.com"
                className="flex items-center gap-3 text-[13px] font-light transition-colors duration-300 hover:text-white group"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <IconMail className="h-4 w-4 flex-shrink-0" style={{ color: "#B8976A" }} stroke={1.5} />
                <span className="break-all text-[12px]">admin@rhoseatte.com</span>
              </a>
              <div
                className="flex items-start gap-3 text-[12px] font-light"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <IconMapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#B8976A" }} stroke={1.5} />
                <span>132, Ramdaspeth, Nagpur, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
              &copy; {new Date().getFullYear()} RHOSEATTE — All rights reserved
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] uppercase tracking-[0.15em] font-medium mr-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                We Accept
              </span>
              {[
                { name: "Visa", src: "/visa.png" },
                { name: "Mastercard", src: "/mc.png" },
                { name: "UPI", src: "/upi.png" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="px-2 py-1 bg-white/95 rounded-[4px] border border-white/10 flex items-center justify-center h-6 min-w-[36px] shadow-sm hover:bg-white hover:scale-105 transition-all duration-300"
                  title={item.name}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className="h-3.5 w-auto object-contain max-w-[30px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
