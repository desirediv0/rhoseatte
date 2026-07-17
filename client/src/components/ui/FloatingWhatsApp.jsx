"use client";

import Image from "next/image";

export const FloatingWhatsApp = () => {
  const phoneNumber = "918796449692";
  const message = encodeURIComponent("Hello RHOSEATTE, I would like to learn more about your luxury fragrances.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-16 md:bottom-5 right-4 md:right-5 z-40 group flex items-center justify-center w-12 h-12 bg-noir border border-gold/20 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.3)] hover:scale-105 hover:border-gold active:scale-95 transition-all duration-300 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 glow-pulse pointer-events-none" />
      <Image
        src="/whatsapp.png"
        alt="WhatsApp Icon"
        width={50}
        height={50}
        className="w-7 h-7 object-contain"
      />
    </a>
  );
};

export default FloatingWhatsApp;
