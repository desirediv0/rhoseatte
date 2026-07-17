import { PageHero } from "@/components/ui/PageHero";
import { Gavel, ShieldCheck, CreditCard } from "lucide-react";

export const metadata = {
    title: "Terms & Conditions | rhoseatte",
    description: "Read rhoseatte's Terms of Use, customised order policies, and secure purchasing agreements in compliance with Razorpay standards.",
};

const provisions = [
    {
        icon: Gavel,
        title: "Craftsmanship Guidelines",
        description: "All products are handcrafted, designed with unique variations that represent the true nature of handmade artisan crafts."
    },
    {
        icon: ShieldCheck,
        title: "Bespoke Orders & Customization",
        description: "We require full style and sizing confirmation before beginning work on customised hair accessories and wedding sets."
    },
    {
        icon: CreditCard,
        title: "Secure Payment routing",
        description: "All payments are securely processed through Razorpay's PCI-DSS compliant infrastructure with no storage of sensitive details."
    }
];

export default function TermsPage() {
    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <PageHero
                title="Terms & Conditions"
                description="Custom design policies, user agreements, Razorpay payment processing terms, and craftsmanship disclaimers"
                breadcrumbs={[{ label: "Terms & Conditions" }]}
                variant="default"
                size="sm"
            />

            <section className="py-16 px-6 sm:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto">

                    {/* Key terms grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {provisions.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-green-50 text-[#003E29] rounded-xl flex items-center justify-center mb-4">
                                    <item.icon className="h-5.5 w-5.5" />
                                </div>
                                <h3 className="font-display   text-slate-900 text-sm mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-[11px] leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Terms Details */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E5E7EB] shadow-sm space-y-10">

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#003E29] rounded-full" />
                                User Agreement & Acceptance
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                By visiting rhoseatte, registering an account, purchasing items, submitting design queries, or confirming customised orders, you explicitly accept these Terms and Conditions. These terms govern your use of the website and constitute a binding legal agreement between you and rhoseatte. If you do not agree to these terms, please do not use the platform.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#D4AF37] rounded-full" />
                                Customised Jewelry Sourcing & Crafting
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                For all custom orders (including specialised hair accessories, bridal sets, and DIY kits):
                            </p>
                            <ul className="space-y-2 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>Custom orders require active styling parameters (color, sizing, bead selection) confirmed by the buyer.</li>
                                <li>Once customized creation begins at our studio, orders cannot be changed or cancelled.</li>
                                <li>We reserve the right to cancel and refund any order if required materials are unavailable.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#003E29] rounded-full" />
                                Payments, Fees & Secure Processing (Razorpay)
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                Online transactions on rhoseatte are processed using the secure Razorpay payment gateway:
                            </p>
                            <ul className="space-y-2 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>We accept major Credit Cards, Debit Cards, Net Banking, UPI, and authorized Wallets supported by Razorpay.</li>
                                <li>All payments are billed in Indian Rupees (INR). You agree to pay the complete price listed at checkout, including any shipping fees.</li>
                                <li>In the event of payment failure or technical error, the transaction may be rolled back, and any debited amount will be refunded directly via Razorpay within 5–7 business days.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#D4AF37] rounded-full" />
                                Product Returns & 7-Day Refund Policy
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                Our return policy preserves handcrafted product safety:
                            </p>
                            <ul className="space-y-2 pl-5 list-disc text-xs md:text-sm text-slate-600">
                                <li>Only non-customized jewellery items can be returned within our standard 7-day return policy.</li>
                                <li>All customized hair accessories, bridal sets, and DIY kits are strictly non-returnable and non-refundable once production or dispatch begins.</li>
                                <li>Returned items must be completely unworn, clean, and in original packaging.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#003E29] rounded-full" />
                                Craftsmanship Disclaimer
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                The informational content, styling advice, and dimensions presented on rhoseatte are for reference. All items are handcrafted, meaning minor variations in colour, bead alignment, finish, and stone texture are natural and part of the unique handmade charm. Handcrafted items should be handled with care to prevent wear and tear.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-display text-xl   text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#D4AF37] rounded-full" />
                                Governing Law & Jurisdiction
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                These Terms and Conditions and any transactions executed on this platform shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <p className="text-sm   text-slate-800">Have questions about our terms?</p>
                                <p className="text-xs text-slate-500 mt-0.5">Our support desk is active daily to resolve your queries.</p>
                            </div>
                            <a
                                href="mailto:rhoseatte@gmail.com"
                                className="text-xs   text-[#003E29] bg-green-50 px-4 py-2.5 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
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
