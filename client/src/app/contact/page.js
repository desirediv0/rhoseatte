"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconMail,
  IconSend,
  IconLoader2,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconChevronDown,
  IconBrandWhatsapp,
  IconPhone,
  IconBuildingStore,
  IconArrowUpRight,
} from "@tabler/icons-react";

/* ─── FAQ Data ──────────────────────────────────────────── */
const faqs = [
  {
    question: "What is RHOSEATTE?",
    answer:
      "RHOSEATTE is a luxury perfume maison dedicated to crafting exquisite fragrances that blend timeless elegance with modern artistry. Each scent is a carefully composed olfactory narrative, created by master perfumers using the world's finest ingredients.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse our collections, select your fragrance, and proceed to checkout. We accept all major payment methods and offer secure, insured shipping across India. You will receive a confirmation email with tracking details once your order is dispatched.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Every RHOSEATTE order arrives in our signature luxury packaging — heavy glass flacon, magnetic closure box, and hand-finished details. For gifting, we offer an elevated gift presentation with a handwritten note at no additional charge.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for unopened, sealed products in their original packaging. If you receive a damaged or defective item, please contact our concierge team within 48 hours for an immediate replacement.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, we ship across India with plans for international expansion. For international inquiries, please reach out to our concierge team via WhatsApp or email, and we will do our best to accommodate your request.",
  },
];

/* ─── FAQ Item ──────────────────────────────────────────── */
function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="font-display text-[16px] text-noir tracking-tight pr-4 group-hover:text-gold-dark transition-colors duration-300">
          {item.question}
        </span>
        <IconChevronDown
          className={`h-5 w-5 text-stone flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-gold" : ""
            }`}
          stroke={1.5}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "max-h-60 pb-6" : "max-h-0"
          }`}
      >
        <p className="text-stone text-[13px] leading-relaxed font-light tracking-wide">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

/* ─── Contact Page ──────────────────────────────────────── */
export default function ContactPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetchApi("/content/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success(response.data?.message || "Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (error) {
      toast.error(error.message || "Failed to send. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/contact-hero.jpg"
          alt="Contact RHOSEATTE"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.35) 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-5 pb-16 md:pb-24 w-full">
            <Reveal>
              <span className="luxe-eyebrow-dark block mb-4">Get in Touch</span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-5 tracking-tight">
                Contact{" "}
                <em className="luxe-italic text-gradient-light">RHOSEATTE</em>
              </h1>
              <span className="block h-px w-16 bg-gold mb-5" />
              <p className="text-white/50 max-w-lg text-sm md:text-base font-light leading-relaxed">
                Whether you seek guidance on selecting your signature scent or
                wish to discuss a private consultation — we are here for you.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Contact Information ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-20 pb-16 md:pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Email */}
          <Reveal delay={0}>
            <a
              href="mailto:hoseatte@gmail.com"
              className="group flex flex-col items-center text-center p-7 bg-white border border-line hover:border-gold/40 transition-all duration-500 h-full"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-4 border border-line bg-ivory group-hover:border-gold/30 transition-colors duration-300">
                <IconMail className="h-5 w-5 text-gold" stroke={1.5} />
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                Email
              </h4>
              <p className="text-[13px] text-noir font-medium break-all">
                rhoseatte@gmail.com
              </p>
            </a>
          </Reveal>

          {/* WhatsApp */}
          <Reveal delay={0.06}>
            <a
              href="https://wa.me/918796449692"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-7 bg-white border border-line hover:border-gold/40 transition-all duration-500 h-full"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-4 border border-line bg-ivory group-hover:border-gold/30 transition-colors duration-300">
                <IconBrandWhatsapp className="h-5 w-5 text-gold" stroke={1.5} />
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                WhatsApp
              </h4>
              <p className="text-[13px] text-noir font-medium">
                +91 87964 49692
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gold font-medium group-hover:gap-2.5 transition-all duration-300">
                Chat Now
                <IconArrowUpRight className="h-3 w-3" stroke={1.5} />
              </span>
            </a>
          </Reveal>

          {/* Phone — Coming Soon */}
          <Reveal delay={0.12}>
            <div className="group flex flex-col items-center text-center p-7 bg-white border border-line h-full">
              <div className="w-12 h-12 flex items-center justify-center mb-4 border border-line bg-ivory">
                <IconPhone className="h-5 w-5 text-gold" stroke={1.5} />
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                Private Concierge
              </h4>
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold font-medium">
                Coming Soon
              </p>
              <p className="text-[11px] text-stone mt-1 font-light">
                By appointment only
              </p>
            </div>
          </Reveal>

          {/* Business Hours & Location */}
          <Reveal delay={0.18}>
            <div className="group flex flex-col p-7 bg-white border border-line h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center border border-line bg-ivory">
                  <IconClock className="h-5 w-5 text-gold" stroke={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone font-medium">
                    Hours
                  </h4>
                  <p className="text-[13px] text-noir font-medium">
                    10:30 AM – 7:00 PM
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-line">
                <a
                  href="https://maps.app.goo.gl/MTy3mYLeAXTr7jxP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-gold font-medium hover:text-gold-dark transition-colors duration-300"
                >
                  <IconMapPin className="h-3.5 w-3.5" stroke={1.5} />
                  View on Google Maps
                  <IconArrowUpRight className="h-3 w-3" stroke={1.5} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact Form + Map ────────────────────────── */}
      <section className="py-16 md:py-24 bg-ivory px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <span className="luxe-eyebrow block mb-5">Send a Message</span>
                <h2 className="font-display text-3xl sm:text-4xl text-noir tracking-tight mb-3">
                  We&apos;d Love to{" "}
                  <em className="italic text-gold-dark">Hear</em> From You
                </h2>
                <p className="text-stone text-[14px] font-light mb-10 tracking-wide">
                  Our concierge team responds within 24 hours. For urgent
                  inquiries, reach us via WhatsApp.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                        className="w-full h-13 px-4 border border-line bg-white text-noir text-[13px] placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                        Phone *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 00000 00000"
                        className="w-full h-13 px-4 border border-line bg-white text-noir text-[13px] placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="you@example.com"
                      className="w-full h-13 px-4 border border-line bg-white text-noir text-[13px] placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full h-13 px-4 border border-line bg-white text-noir text-[13px] appearance-none focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    >
                      <option>General Inquiry</option>
                      <option>Order Status</option>
                      <option>Collaboration</option>
                      <option>Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3.5 border border-line bg-white text-noir text-[13px] resize-none placeholder:text-stone/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-noir text-white text-[11px] uppercase font-semibold tracking-[0.15em] hover:bg-gold transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {formLoading ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.5} />
                    ) : (
                      <>
                        Send Message
                        <IconSend className="h-4 w-4" stroke={1.5} />
                      </>
                    )}
                  </button>
                </form>
              </Reveal>
            </div>

            {/* Map / Visit Us */}
            <div className="lg:col-span-5">
              <Reveal delay={0.15}>
                <span className="luxe-eyebrow block mb-5">Visit Us</span>
                <h2 className="font-display text-3xl sm:text-4xl text-noir tracking-tight mb-3">
                  Our <em className="italic text-gold-dark">Atelier</em>
                </h2>
                <p className="text-stone text-[14px] font-light mb-8 tracking-wide">
                  Visit our space to experience the collection in person. By
                  appointment preferred.
                </p>

                <div className="bg-ivory border border-line overflow-hidden">
                  <div className="relative aspect-[4/3] bg-ivory-deep">
                    <Image
                      src="/contact-map.jpg"
                      alt="RHOSEATTE Location"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href="https://maps.app.goo.gl/MTy3mYLeAXTr7jxP"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-line text-noir text-[11px] uppercase font-medium tracking-[0.15em] hover:border-gold hover:text-gold transition-all duration-300"
                      >
                        <IconMapPin className="h-4 w-4" stroke={1.5} />
                        Open in Maps
                        <IconArrowUpRight className="h-3.5 w-3.5" stroke={1.5} />
                      </a>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <IconBuildingStore className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" stroke={1.5} />
                      <div>
                        <p className="text-[13px] text-noir font-medium">RHOSEATTE Atelier</p>
                        <p className="text-[12px] text-stone font-light mt-0.5">
                          Premium Fragrance Studio
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IconClock className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" stroke={1.5} />
                      <div>
                        <p className="text-[13px] text-noir font-medium">Hours</p>
                        <p className="text-[12px] text-stone font-light mt-0.5">
                          10:30 AM – 7:00 PM (Daily)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="luxe-eyebrow block mb-5">Questions</span>
              <h2 className="font-display text-3xl sm:text-4xl text-noir tracking-tight">
                Frequently{" "}
                <em className="italic text-gold-dark">Asked</em>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-line">
              {faqs.map((faq, i) => (
                <FAQItem key={i} item={faq} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/contact-cta.jpg"
          alt="Book a Consultation"
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.3) 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Reveal>
            <div className="text-center px-5">
              <span className="luxe-eyebrow-dark block mb-5">
                Private Experience
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-6 tracking-tight">
                Book Your Fragrance{" "}
                <em className="luxe-italic text-gradient-light">Consultation</em>
              </h2>
              <span className="block h-px w-16 bg-gold mx-auto mb-8" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-white text-[11px] uppercase font-semibold tracking-[0.15em] hover:bg-gold-dark transition-colors duration-500"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Explore Collection
                  <IconArrowRight className="h-4 w-4" stroke={1.5} />
                </Link>
                <a
                  href="https://wa.me/918796449692"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/25 text-white text-[11px] uppercase font-medium tracking-[0.15em] hover:bg-white/10 transition-all duration-500"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <IconBrandWhatsapp className="h-4 w-4" stroke={1.5} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
