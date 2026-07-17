import { Truck, Package, Clock, ShieldCheck, MapPin, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy | rhoseatte",
  description: "Learn about rhoseatte's premium packaging, global shipping options, delivery timelines, and transit protocols for handcrafted jewellery.",
};

const SHIPPING_CARDS = [
  {
    icon: Package,
    color: "#D4AF37",
    title: "Premium Gift Packaging",
    description: "Every order is carefully packed in our signature protective boxes, ready for gifting and designed to prevent scratches during transit.",
  },
  {
    icon: Globe,
    color: "#003E29",
    title: "Worldwide Shipping",
    description: "Expedited shipping covering major cities in India and global international destinations with reliable cargo partners.",
  },
  {
    icon: Clock,
    color: "#003E29",
    title: "5-10 Days Timeline",
    description: "Custom orders are crafted and delivered to your doorstep within 5-10 business days across India and major international hubs.",
  },
  {
    icon: ShieldCheck,
    color: "#D4AF37",
    title: "100% Secure Transit",
    description: "All shipments are fully tracked and delivered via premium couriers with signature verification upon delivery.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F7FAFC" }}>

      {/* ── Hero ── */}
      <section
        className="relative py-14 md:py-18 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #002216 0%, #003E29 60%, #005a3c 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4AF37, transparent 70%)" }} />
          <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #D4AF37, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/70">Shipping Policy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-white mb-3">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-white/65 max-w-xl text-base font-sans">
            Premium transit protocols for handcrafted accessories and custom jewelry, delivered safely across India and worldwide.
          </p>
        </div>
      </section>

      {/* ── Cards grid ── */}
      <section className="py-12 px-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {SHIPPING_CARDS.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${card.color}12` }}
                >
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <h3 className="font-display text-base mb-2" style={{ color: "#002216" }}>{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* ── Policy prose ── */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border space-y-10" style={{ borderColor: "#E5E7EB" }}>

            {/* Section 1 */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b flex items-center gap-2.5 font-display" style={{ color: "#002216", borderColor: "#E5E7EB" }}>
                <span className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: "#003E29" }} />
                Delivery Logistics &amp; Shipping Fees
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We use premier express networks (Blue Dart, Delhivery, and DHL for global orders) to ensure your handcrafted jewelry arrives in perfect, pristine condition.
              </p>
              <ul className="space-y-2.5 pl-5 list-disc text-sm text-gray-600">
                <li><strong className="text-gray-800">Orders above ₹999:</strong> Free expedited shipping across all deliverable PIN codes in India.</li>
                <li><strong className="text-gray-800">Orders below ₹999:</strong> Flat shipping charge of ₹99 applies.</li>
                <li><strong className="text-gray-800">International Shipping:</strong> Shipping fees for orders outside India are calculated dynamically at checkout based on destination and package weight.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b flex items-center gap-2.5 font-display" style={{ color: "#002216", borderColor: "#E5E7EB" }}>
                <span className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: "#D4AF37" }} />
                No COD Policy &amp; Surcharges
              </h2>
              <div
                className="p-5 rounded-2xl mb-4 border"
                style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.2)" }}
              >
                <p className="text-sm mb-2 flex items-center gap-2" style={{ color: "#002216" }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  Secure Online Payments Only
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  In order to maintain quick processing timelines and safety, **rhoseatte does not offer Cash on Delivery (COD)**. All orders must be prepaid online via our secure payment gateway.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b flex items-center gap-2.5 font-display" style={{ color: "#002216", borderColor: "#E5E7EB" }}>
                <span className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: "#003E29" }} />
                Tracking &amp; Transit Updates
              </h2>
              <ul className="space-y-2.5 pl-5 list-disc text-sm text-gray-600">
                <li>On dispatch, a secure tracking link is sent to your registered mobile number via WhatsApp and email.</li>
                <li>Real-time status updates — including package arrival at city hubs — are viewable live.</li>
                <li>For high-value customized orders, a delivery representative coordinates via phone before arrival to ensure someone is present to sign for the package.</li>
              </ul>
            </div>

            {/* CTA row */}
            <div
              className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-5"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#002216" }}>Have specific shipping requirements?</p>
                <p className="text-xs text-gray-500 mt-0.5">Contact our support team for customized dispatch timelines.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href="mailto:rhoseatte@gmail.com"
                  className="text-xs px-4 py-2.5 rounded-xl border transition-colors hover:opacity-90 text-center"
                  style={{ color: "#003E29", background: "rgba(0,62,41,0.06)", borderColor: "#E5E7EB" }}
                >
                  rhoseatte@gmail.com
                </a>
                <a
                  href="https://wa.me/918796449692"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2.5 rounded-xl transition-colors hover:opacity-90 text-center text-white"
                  style={{ background: "#25D366" }}
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
