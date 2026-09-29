import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

interface InvoiceSettings {
    id: string;
    companyName: string | null;
    addressLine: string | null;
    gstin: string | null;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
    invoicePrefix: string;
}

export default function InvoiceSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [companyName, setCompanyName] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [gstin, setGstin] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [invoicePrefix, setInvoicePrefix] = useState("INV");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get("/api/admin/orders/invoice-settings");
            if (response.data.success) {
                const data: InvoiceSettings = response.data.data.settings;
                setCompanyName(data.companyName || "");
                setAddressLine(data.addressLine || "");
                setGstin(data.gstin || "");
                setEmail(data.email || "");
                setPhone(data.phone || "");
                setLogoUrl(data.logoUrl || "");
                setInvoicePrefix(data.invoicePrefix || "INV");
            }
        } catch (error) {
            console.error("Error fetching invoice settings:", error);
            toast.error("Failed to load invoice settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await api.put("/api/admin/orders/invoice-settings", {
                companyName,
                addressLine,
                gstin,
                email,
                phone,
                logoUrl,
                invoicePrefix,
            });
            if (response.data.success) {
                toast.success("Invoice settings saved");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save invoice settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4CAF50]" />
                    <p className="mt-4 text-base text-[#9CA3AF]">Loading invoice settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#1F2937] tracking-tight">
                        Invoice Settings
                    </h1>
                    <p className="text-[#9CA3AF] text-sm mt-1.5">
                        Company details shown on the header of every generated invoice — all optional
                    </p>
                </div>
                <div className="h-px bg-[#E5E7EB]" />
            </div>

            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-[#4CAF50]" />
                        Company Details
                    </CardTitle>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Leave any field blank to omit it from the invoice — invoices generate fine either way
                    </p>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Rhoseatte"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gstin">GSTIN (optional)</Label>
                            <Input
                                id="gstin"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value)}
                                placeholder="e.g. 07AAAAA0000A1Z5"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressLine">Address</Label>
                        <Input
                            id="addressLine"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            placeholder="Registered business address"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@rhoseatte.shop"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="7678336268"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                            <Input
                                id="logoUrl"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                            <Input
                                id="invoicePrefix"
                                value={invoicePrefix}
                                onChange={(e) => setInvoicePrefix(e.target.value)}
                                placeholder="INV"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
