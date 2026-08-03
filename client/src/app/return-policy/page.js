import Link from "next/link";
import { RefreshCw, Video, ShieldAlert, Mail } from "lucide-react";

export const metadata = {
    title: "Returns & Refund Policy | Rhoseatte Fragrances",
    description: "Review Rhoseatte Fragrances' Returns & Refund Policy, mandatory unboxing video guidelines, replacement terms, and refund eligibility.",
};

const returnSteps = [
    {
        step: 1,
        title: "Mandatory Unboxing Video",
        description: "Record continuous unboxing video starting before opening shipping box."
    },
    {
        step: 2,
        title: "Report Within 24 Hours",
        description: "Submit video and order details to customercare@rhoseatte.com."
    },
    {
        step: 3,
        title: "Quality Review",
        description: "Our team inspects defect, transit damage, or wrong item claim."
    },
    {
        step: 4,
        title: "Replacement / Resolution",
        description: "Approved replacement or eligible resolution dispatched promptly."
    }
];

export default function ReturnPolicyPage() {
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
                        <span className="text-white/80 font-medium">Returns &amp; Refund Policy</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-white font-medium tracking-tight mb-2">
                        Returns &amp; Refund Policy
                    </h1>
                </div>
            </section>

            {/* ── Policy Content ── */}
            <section className="py-12 md:py-16 px-6 font-sans">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Return Workflow Grid */}
                    <div className="bg-white rounded-3xl p-8 border border-white/20 shadow-2xl">
                        <h2 className="font-serif text-xl md:text-2xl text-[#240E42] mb-6 text-center flex items-center justify-center gap-2 font-bold">
                            <RefreshCw className="w-5 h-5 text-[#4A2478]" /> Replacement &amp; Claim Steps
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {returnSteps.map((item) => (
                                <div key={item.step} className="text-center relative">
                                    <div className="w-10 h-10 bg-[#FAF5FF] text-[#4A2478] border border-[#E8DAFA] rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-base">
                                        {item.step}
                                    </div>
                                    <h3 className="text-[#240E42] text-xs font-bold mb-1">{item.title}</h3>
                                    <p className="text-black/60 text-[11px] leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Policy Prose Body */}
                    <div className="bg-white rounded-3xl p-8 md:p-14 shadow-2xl space-y-8 text-black/80">

                        <div className="border-b border-black/10 pb-6">
                            <p className="text-sm md:text-base leading-relaxed text-black/75">
                                At <strong className="text-[#4A2478]">Rhoseatte Fragrances</strong>, every perfume is handcrafted in small batches with great care and attention to detail. Due to the personal nature of fragrance products and hygiene considerations, we follow a strict Returns &amp; Replacement Policy.
                            </p>
                        </div>

                        {/* Returns */}
                        <div className="space-y-3">
                            <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                                Returns
                            </h2>
                            <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                For hygiene, safety, and quality assurance reasons, all perfume purchases are non-returnable.
                            </p>
                            <p className="text-xs text-black/70 font-medium">We do not accept returns for:</p>
                            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-black/75 bg-black/[0.02] p-4 rounded-2xl border border-black/5">
                                <li>• Change of mind</li>
                                <li>• Personal fragrance preference</li>
                                <li>• Incorrect product selection by customer</li>
                                <li>• Opened, used, or partially consumed items</li>
                                <li>• Customized or bespoke perfumes</li>
                                <li>• Gift purchases</li>
                                <li>• Sale, promotional, or clearance items</li>
                            </ul>
                            <p className="text-xs text-black/60 italic">
                                We encourage customers to carefully read product descriptions before placing an order.
                            </p>
                        </div>

                        {/* Replacements */}
                        <div className="space-y-3 pt-4 border-t border-black/5">
                            <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                                Replacements
                            </h2>
                            <p className="text-sm text-black/70">We offer replacements only under the following circumstances:</p>
                            <ul className="space-y-1 text-xs text-black/75 list-disc pl-5 font-medium">
                                <li>The product was damaged during transit.</li>
                                <li>The wrong product was delivered.</li>
                                <li>The product was received with a manufacturing defect.</li>
                            </ul>
                            <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-semibold">
                                Replacement requests must be submitted within 24 hours of delivery. Requests received after this period may not be eligible for replacement.
                            </div>
                        </div>

                        {/* Mandatory Unboxing Video */}
                        <div className="space-y-3 pt-4 border-t border-black/5 p-5 bg-[#FAF5FF] border border-[#E8DAFA] rounded-2xl">
                            <h2 className="text-lg font-serif font-bold text-[#4A2478] flex items-center gap-2">
                                <Video className="w-5 h-5 text-[#4A2478]" />
                                Mandatory Unboxing Video
                            </h2>
                            <p className="text-xs text-black/80 font-medium leading-relaxed">
                                To process any damage, missing item, or incorrect product claim, a continuous, uninterrupted unboxing video is mandatory.
                            </p>
                            <p className="text-xs text-[#4A2478] font-bold">The video must:</p>
                            <ul className="space-y-1.5 text-xs text-black/70 list-disc pl-5">
                                <li>Begin before opening the outer shipping package.</li>
                                <li>Clearly show the sealed shipping package from all sides.</li>
                                <li>Continue without any cuts or pauses until the entire package and its contents are fully unpacked.</li>
                                <li>Clearly display the damaged, defective, or incorrect item, if applicable.</li>
                            </ul>
                            <p className="text-xs text-red-600 font-bold pt-1">
                                Photos alone are not sufficient for claim verification. Claims submitted without the required unboxing video will not be eligible for replacement or refund.
                            </p>
                        </div>

                        {/* Damaged During Transit & Incorrect Product */}
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-black/5">
                            <div className="space-y-2">
                                <h3 className="font-serif font-bold text-[#240E42] text-base">Damaged During Transit</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    If your order arrives damaged:
                                </p>
                                <ul className="space-y-1 text-[11px] text-black/75 list-disc pl-4">
                                    <li>Record and save the complete unboxing video.</li>
                                    <li>Contact us within 24 hours of delivery.</li>
                                    <li>Share order number, unboxing video, and photos of damaged product.</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif font-bold text-[#240E42] text-base">Incorrect Product Received</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    If you receive a product different from what you ordered:
                                </p>
                                <ul className="space-y-1 text-[11px] text-black/75 list-disc pl-4">
                                    <li>Notify us within 24 hours of delivery.</li>
                                    <li>Share the required unboxing video and order details.</li>
                                    <li>Once verified, we will arrange the correct replacement.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Manufacturing Defects */}
                        <div className="space-y-2 pt-4 border-t border-black/5">
                            <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                                Manufacturing Defects
                            </h2>
                            <p className="text-xs text-black/70 leading-relaxed">
                                If you believe your product has a genuine manufacturing defect, please contact us within 24 hours of delivery. Each case will be individually reviewed before approving a replacement.
                            </p>
                            <p className="text-[11px] text-black/50 italic">
                                Normal variations in fragrance, slight color differences, or minor cosmetic imperfections associated with handcrafted products shall not be considered manufacturing defects.
                            </p>
                        </div>

                        {/* Customized & Bespoke Perfumes */}
                        <div className="space-y-2 pt-4 border-t border-black/5">
                            <h2 className="text-lg md:text-xl font-serif font-bold text-[#240E42]">
                                Customized &amp; Bespoke Perfumes
                            </h2>
                            <p className="text-xs text-black/70 leading-relaxed">
                                Customized, personalized, or bespoke fragrances are created specifically for each customer. Therefore, they are <strong>Non-returnable, Non-exchangeable, and Non-refundable</strong>, except where the product has been damaged during transit or an incorrect product has been delivered.
                            </p>
                        </div>

                        {/* Refunds & Exchange Policy */}
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-black/5">
                            <div className="space-y-2">
                                <h3 className="font-serif font-bold text-[#240E42] text-base">Refunds</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    Refunds are generally not offered. Approved refunds in exceptional circumstances (unfulfillable product, unavailable replacement, pre-dispatch cancellation) will be processed to original payment method within <strong>7–10 business days</strong>.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif font-bold text-[#240E42] text-base">Exchange Policy</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    We do not offer exchanges based on fragrance preference, personal expectations, or ordering wrong items. Exchanges are only provided when an approved replacement request has been verified.
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Policy & Quality Variations */}
                        <div className="space-y-3 pt-4 border-t border-black/5">
                            <div>
                                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1">Cancellation Policy</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    Orders may be cancelled only before they enter production or dispatch. Customized or bespoke perfume orders cannot be cancelled once formulation has begun.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1">Quality Variations</h3>
                                <p className="text-xs text-black/70 leading-relaxed">
                                    As every Rhoseatte perfume is handcrafted in small batches, slight variations in fragrance maturation, liquid colour, or natural ingredient appearance may occur. These natural variations do not affect product quality and are not considered defects.
                                </p>
                            </div>
                        </div>

                        {/* Fraudulent Claims */}
                        <div className="space-y-2 pt-4 border-t border-black/5 p-4 bg-red-50/60 border border-red-100 rounded-2xl">
                            <h3 className="font-serif font-bold text-red-900 text-sm flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-red-600" />
                                Fraudulent Claims
                            </h3>
                            <p className="text-xs text-red-800 leading-relaxed">
                                Rhoseatte Fragrances reserves the right to reject any claim that appears fraudulent, misleading, incomplete, or unsupported by the required evidence. Repeated misuse of the Returns &amp; Replacement Policy may result in refusal of future service.
                            </p>
                        </div>

                        {/* Contact Us */}
                        <div className="pt-6 border-t-2 border-[#4A2478]/20 bg-[#FAF5FF] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-serif font-bold text-[#240E42] text-base mb-1 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#4A2478]" />
                                    Contact Us
                                </h3>
                                <p className="text-xs text-black/70">
                                    For any replacement or order-related assistance, please contact our customer support team.
                                </p>
                                <p className="text-xs font-medium text-black/80 mt-1">
                                    Email: <a href="mailto:customercare@rhoseatte.com" className="text-[#4A2478] underline">customercare@rhoseatte.com</a>
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
