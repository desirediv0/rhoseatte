import { PageHero } from "@/components/ui/PageHero";
import { BadgeAlert, RefreshCw } from "lucide-react";

export const metadata = {
    title: "Return & Cancellation Policy | rhoseatte",
    description: "Review rhoseatte's handcrafted jewellery return guidelines, customized item restrictions, refund approvals, and replacement terms.",
};

const returnSteps = [
    {
        step: 1,
        title: "Report Issue",
        description: "Submit details or photo proof of your query within 24 hours of delivery."
    },
    {
        step: 2,
        title: "Quality Review",
        description: "Our studio team inspects the item alignment, beads, and materials."
    },
    {
        step: 3,
        title: "Free Retrieval",
        description: "For approved claims, we schedule a secure pickup at your address."
    },
    {
        step: 4,
        title: "Refund/Exchange",
        description: "Credit processed back to the original source in 5–7 business days."
    }
];

export default function ReturnPolicyPage() {
    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <PageHero
                title="Return & Cancellation Policy"
                description="Our commitment to handcrafted quality, customized orders, and secure refund processing"
                breadcrumbs={[{ label: "Return Policy" }]}
                variant="default"
                size="sm"
            />

            <section className="py-16 px-6 sm:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto">

                    {/* Return Process Timeline */}
                    <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm mb-12">
                        <h2 className="font-display text-2xl text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
                            <RefreshCw className="w-5.5 h-5.5 text-[#003E29]" /> Return &amp; Exchange Workflow
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {returnSteps.map((item) => (
                                <div key={item.step} className="text-center relative">
                                    <div className="w-12 h-12 bg-green-50 text-[#003E29] border border-green-100 rounded-full flex items-center justify-center mx-auto mb-4 font-display text-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="text-slate-800 text-sm font-semibold mb-1.5">{item.title}</h3>
                                    <p className="text-slate-500 text-[11px] leading-normal px-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Guidelines Prose */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E5E7EB] shadow-sm space-y-10">

                        {/* CRITICAL WARNING ALERT */}
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/60 flex gap-4 items-start">
                            <BadgeAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-900">Important Customization Notice</h4>
                                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                                    To maintain artisan quality standards, all **customised hair accessories, bespoke jewelry, and bridal sets** are strictly **non-returnable and non-refundable** once crafting or dispatch has begun. We create these specifically to your requested sizes and designs.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-display text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#003E29] rounded-full" />
                                Return Eligibility Criteria
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 font-semibold text-amber-900 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                Note: Only non-customized jewellery items can be returned within our 7-day return policy. Customised items are strictly non-returnable.
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Eligible non-customized jewellery items can be returned within **7 days of delivery** under the following conditions:
                            </p>
                            <ul className="space-y-3 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>The item must be completely unworn, clean, and in original packaging.</li>
                                <li>All tags, labels, and gift boxes must remain intact.</li>
                                <li>The product must not show physical scratches, damage, or wear.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#D4AF37] rounded-full" />
                                Damaged or Defective Deliveries
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                In the rare case that your order arrived damaged or with a defect, we will initiate a **free replacement or 100% refund**:
                            </p>
                            <ul className="space-y-3 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>Please take high-resolution photos of the package and immediately contact us at **rhoseatte@gmail.com** or WhatsApp (+91 87964 49692) within **24 hours** of delivery.</li>
                                <li>Upon verification, our courier will collect the parcel free of charge and deliver a priority replacement.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#003E29] rounded-full" />
                                Refund Disbursement
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Once returned items are received at our studio and inspected:
                            </p>
                            <ul className="space-y-3 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>Refund approvals are finalized within **2 business days** of receiving the return.</li>
                                <li>All online transaction refunds are processed directly to your original payment source (Credit Card, Debit Card, Net Banking, or UPI Wallet).</li>
                                <li>Approved refunds generally reflect in your account within **5–7 business days**, in line with card network and partner bank processing rules.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#D4AF37] rounded-full" />
                                Order Cancellation Terms
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                You can request an order cancellation before it is dispatched or before customization crafting starts. Once dispatched, orders cannot be cancelled. To cancel, please reach out to our customer support desk immediately. Upon successful cancellation, a 100% refund will be credited back.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Need support with a return or refund?</p>
                                <p className="text-xs text-slate-500 mt-0.5">Our support staff is ready to assist you. Responses are active daily.</p>
                            </div>
                            <a
                                href="mailto:rhoseatte@gmail.com"
                                className="text-xs text-[#003E29] bg-green-50 px-4 py-2.5 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
                            >
                                rhoseatte@gmail.com
                            </a>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
