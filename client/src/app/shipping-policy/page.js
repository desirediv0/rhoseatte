import Link from "next/link";
import { Mail, Clock, MapPin, Truck, AlertTriangle, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | Rhoseatte Fragrances",
  description: "Learn about Rhoseatte Fragrances' handcrafted order processing timelines, delivery coverage, tracking updates, and shipping terms.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#4A2478" }}>

      {/* ── Banner Header ── */}
      <section
        className="relative py-14 md:py-18 overflow-hidden border-b border-white/10"
        style={{ background: "linear-gradient(135deg, #240E42 0%, #4A2478 60%, #6533A3 100%)" }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-white">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80 font-medium">Shipping Policy</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-white font-medium tracking-tight mb-2">
            Shipping &amp; Delivery Policy
          </h1>
        </div>
      </section>

      {/* ── Policy Body Content ── */}
      <section className="py-12 md:py-16 px-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-14 shadow-2xl space-y-8 text-black/80">

            <div className="border-b border-black/10 pb-6">
              <p className="text-sm md:text-base leading-relaxed text-black/75">
                At <strong className="text-[#4A2478]">Rhoseatte Fragrances</strong>, every fragrance is thoughtfully handcrafted in small batches to ensure exceptional quality and freshness. We appreciate your patience as we carefully prepare each order with attention to detail.
              </p>
            </div>

            {/* Order Processing */}
            <div className="space-y-3">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#4A2478]" />
                Order Processing
              </h2>
              <ul className="space-y-2 text-sm text-black/70 list-disc pl-5 leading-relaxed">
                <li>All orders are handmade and processed after your order is successfully placed.</li>
                <li>Standard orders are generally processed within <strong>2–7 business days</strong> before dispatch.</li>
                <li>During product launches, festive seasons, promotional events, or periods of high demand, processing may take slightly longer.</li>
                <li>Orders are processed only after successful payment confirmation.</li>
              </ul>
            </div>

            {/* Standard Perfume Orders */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#4A2478]" />
                Standard Perfume Orders
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Since every fragrance is handcrafted, the estimated delivery timeline is:
              </p>
              <div className="p-4 bg-[#FAF5FF] border border-[#E8DAFA] rounded-2xl text-sm font-medium text-[#4A2478]">
                <strong>5–20 business days</strong> from the date of order confirmation, depending on your location and courier operations.
              </div>
            </div>

            {/* Customized & Bespoke Perfumes */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Customized &amp; Bespoke Perfumes
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Customized fragrances require additional formulation, testing, and preparation.
              </p>
              <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-sm text-amber-900 font-medium">
                Estimated delivery time: <strong>3–4 weeks</strong> from order confirmation.
              </div>
              <p className="text-xs text-black/60 italic">
                Customers will be informed if additional time is required for any special requests.
              </p>
            </div>

            {/* Shipping Coverage */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4A2478]" />
                Shipping Coverage
              </h2>
              <ul className="space-y-2 text-sm text-black/70 list-disc pl-5 leading-relaxed">
                <li>We currently ship across most serviceable locations within India.</li>
                <li>If your delivery address falls outside our courier partners&apos; serviceable areas, we will contact you regarding alternative arrangements or order cancellation with a full refund.</li>
                <li>International shipping may be introduced in the future.</li>
              </ul>
            </div>

            {/* Shipping Charges */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Shipping Charges
              </h2>
              <ul className="space-y-2 text-sm text-black/70 list-disc pl-5 leading-relaxed">
                <li>Shipping charges, if applicable, will be displayed during checkout before payment.</li>
                <li>From time to time, Rhoseatte may offer free shipping promotions on eligible orders.</li>
              </ul>
            </div>

            {/* Order Tracking */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Order Tracking
              </h2>
              <p className="text-sm text-black/70">
                Once your order has been dispatched, you will receive:
              </p>
              <ul className="space-y-1 text-sm text-black/70 list-disc pl-5">
                <li>Shipping confirmation</li>
                <li>Tracking ID</li>
                <li>Courier partner details</li>
              </ul>
              <p className="text-xs text-black/50 italic pt-1">
                Tracking updates may take up to 24 hours to appear after dispatch.
              </p>
            </div>

            {/* Delivery Delays */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Delivery Delays
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                While we strive to deliver every order within the estimated timeline, delays may occur due to circumstances beyond our control, including but not limited to:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-black/75 bg-black/[0.02] p-4 rounded-2xl border border-black/5">
                <span>• Extreme weather conditions</span>
                <span>• Natural disasters (Floods, cyclones)</span>
                <span>• Political unrest or civil disturbances</span>
                <span>• Government restrictions / lockdowns</span>
                <span>• Public holidays & courier operational delays</span>
                <span>• Transportation disruptions</span>
                <span>• High order volumes during sales/festivals</span>
                <span>• Incorrect or incomplete delivery info</span>
              </div>
              <p className="text-xs text-black/60 italic pt-1">
                In such situations, delivery timelines may be extended. Rhoseatte Fragrances shall not be held liable for delays arising from these circumstances.
              </p>
            </div>

            {/* Incorrect Shipping Address */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Incorrect Shipping Address
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Customers are responsible for providing complete and accurate shipping information. Rhoseatte Fragrances is not responsible for delays, failed deliveries, or additional shipping charges resulting from incorrect addresses, incomplete PIN codes, or recipient unavailability.
              </p>
              <p className="text-xs text-black/60">
                If an order is returned due to an incorrect address or repeated failed delivery attempts, re-shipping charges may apply.
              </p>
            </div>

            {/* Multiple Delivery Attempts */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Multiple Delivery Attempts
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Courier partners generally make 2–3 delivery attempts. If delivery cannot be completed after these attempts, the shipment may be returned to us. Re-dispatch of returned shipments will be subject to additional shipping charges.
              </p>
            </div>

            {/* Delivery Acceptance */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Delivery Acceptance
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                Please inspect your package at the time of delivery. If the outer packaging appears visibly damaged or tampered with, we recommend recording an uninterrupted unboxing video starting before opening the shipping package. This video is required for any transit damage claims in accordance with our Returns &amp; Replacement Policy.
              </p>
            </div>

            {/* Delayed or Lost Shipments */}
            <div className="space-y-3 pt-4 border-t border-black/5">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                Delayed or Lost Shipments
              </h2>
              <p className="text-sm text-black/70 leading-relaxed">
                If your shipment appears delayed beyond the estimated delivery period or tracking has not been updated for several days, please contact us. In rare cases where a shipment is confirmed lost in transit by the courier partner, Rhoseatte will arrange a replacement or an appropriate resolution at its sole discretion.
              </p>
            </div>

            {/* Refusal of Delivery & Force Majeure */}
            <div className="space-y-4 pt-4 border-t border-black/5">
              <div>
                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1">Refusal of Delivery</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  If a customer refuses delivery of a prepaid order without a valid reason, shipping and return handling charges (if any) may be deducted from any eligible refund.
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1">Force Majeure</h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Rhoseatte Fragrances shall not be held responsible for any failure or delay in fulfilling its shipping obligations due to events beyond its reasonable control, including acts of God, natural disasters, epidemics, strikes, or transportation failures.
                </p>
              </div>
            </div>

            {/* Contact Us */}
            <div className="pt-6 border-t-2 border-[#4A2478]/20 bg-[#FAF5FF] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#4A2478]" />
                  Contact Us
                </h3>
                <p className="text-xs text-black/70">
                  If you have any questions regarding your shipment, please contact our customer support team.
                </p>
                <p className="text-xs font-medium text-black/80 mt-1">
                  Email: <a href="mailto:customercare@rhoseatte.com" className="text-[#4A2478] underline">customercare@rhoseatte.com</a>
                </p>
                <p className="text-[11px] text-black/50 mt-0.5">
                  Business Hours: Monday – Saturday, 10:00 AM – 6:00 PM IST
                </p>
              </div>
              <a
                href="mailto:customercare@rhoseatte.com"
                className="px-6 py-3 bg-[#4A2478] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#38195E] transition-all text-center shrink-0 shadow-md"
              >
                Email Support
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
