import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Truck,
    Package,
    MapPin,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DelhiverySettings {
    id: string;
    isEnabled: boolean;
    apiToken: string | null;
    clientName: string | null;
    bookingMode: string;
    defaultLength: number;
    defaultBreadth: number;
    defaultHeight: number;
    defaultWeight: number;
}

interface PickupAddress {
    id: string;
    nickname: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    address2: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
    delhiveryRegistered: boolean;
}

export default function DelhiverySettingsPage() {
    const [settings, setSettings] = useState<DelhiverySettings | null>(null);
    const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDimensions, setIsSavingDimensions] = useState(false);
    const [isSavingBookingMode, setIsSavingBookingMode] = useState(false);
    const [isSavingDefaultCourier, setIsSavingDefaultCourier] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // Form states
    const [apiToken, setApiToken] = useState("");
    const [clientName, setClientName] = useState("");
    const [bookingMode, setBookingMode] = useState<string>("MANUAL");
    const [defaultLength, setDefaultLength] = useState(10);
    const [defaultBreadth, setDefaultBreadth] = useState(10);
    const [defaultHeight, setDefaultHeight] = useState(10);
    const [defaultWeight, setDefaultWeight] = useState(0.5);
    const [defaultCourierProvider, setDefaultCourierProvider] = useState<string>("SHIPROCKET");

    // Address form states
    const [addressForm, setAddressForm] = useState({
        nickname: "Primary Warehouse",
        name: "",
        email: "",
        phone: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        isDefault: true,
    });

    useEffect(() => {
        fetchSettings();
        fetchPickupAddresses();
        fetchDefaultCourier();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get("/api/admin/delhivery/settings");
            if (response.data.success) {
                const data = response.data.data.settings;
                setSettings(data);
                setApiToken(data.apiToken || "");
                setClientName(data.clientName || "");
                setBookingMode(data.bookingMode || "MANUAL");
                setDefaultLength(data.defaultLength || 10);
                setDefaultBreadth(data.defaultBreadth || 10);
                setDefaultHeight(data.defaultHeight || 10);
                setDefaultWeight(data.defaultWeight || 0.5);
            }
        } catch (error) {
            console.error("Error fetching Delhivery settings:", error);
            toast.error("Failed to load Delhivery settings");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPickupAddresses = async () => {
        try {
            const response = await api.get("/api/admin/delhivery/pickup-addresses");
            if (response.data.success) {
                setPickupAddresses(response.data.data.addresses || []);
            }
        } catch (error) {
            console.error("Error fetching Delhivery pickup addresses:", error);
        }
    };

    // Default courier is a site-wide setting stored on Shiprocket's settings row
    const fetchDefaultCourier = async () => {
        try {
            const response = await api.get("/api/admin/shiprocket/settings");
            if (response.data.success) {
                setDefaultCourierProvider(response.data.data.settings.defaultCourierProvider || "SHIPROCKET");
            }
        } catch (error) {
            console.error("Error fetching default courier setting:", error);
        }
    };

    const handleSaveDefaultCourier = async (provider: string) => {
        try {
            setIsSavingDefaultCourier(true);
            const response = await api.put("/api/admin/delhivery/settings", {
                defaultCourierProvider: provider,
            });
            if (response.data.success) {
                setDefaultCourierProvider(provider);
                toast.success("Default courier updated");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update default courier");
        } finally {
            setIsSavingDefaultCourier(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            const response = await api.put("/api/admin/delhivery/settings", {
                isEnabled: settings?.isEnabled,
                apiToken: apiToken !== "********" ? apiToken : undefined,
                clientName,
            });

            if (response.data.success) {
                toast.success("Settings saved successfully");
                setSettings(response.data.data.settings);
            }
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(error.response?.data?.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDimensions = async () => {
        try {
            setIsSavingDimensions(true);
            const response = await api.put("/api/admin/delhivery/settings", {
                defaultLength,
                defaultBreadth,
                defaultHeight,
                defaultWeight,
            });

            if (response.data.success) {
                toast.success("Default dimensions saved");
                setSettings(response.data.data.settings);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save dimensions");
        } finally {
            setIsSavingDimensions(false);
        }
    };

    const handleSaveBookingMode = async () => {
        try {
            setIsSavingBookingMode(true);
            const response = await api.put("/api/admin/delhivery/settings", { bookingMode });

            if (response.data.success) {
                toast.success("Booking mode updated successfully!");
                setSettings(response.data.data.settings);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save booking mode");
        } finally {
            setIsSavingBookingMode(false);
        }
    };

    const handleToggle = async (enabled: boolean) => {
        if (enabled && !apiToken) {
            toast.error("Please enter an API token first");
            return;
        }

        try {
            setIsSaving(true);
            const response = await api.put("/api/admin/delhivery/settings", { isEnabled: enabled });

            if (response.data.success) {
                setSettings(response.data.data.settings);
                toast.success(enabled ? "Delhivery enabled" : "Delhivery disabled");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!apiToken) {
            toast.error("Please enter an API token first");
            return;
        }

        await handleSaveSettings();

        try {
            setIsTesting(true);
            const response = await api.post("/api/admin/delhivery/test-connection");
            if (response.data.success && response.data.data.connected) {
                toast.success("Connection successful");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Connection failed");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveAddress = async () => {
        if (
            !addressForm.name ||
            !addressForm.email ||
            !addressForm.phone ||
            !addressForm.address ||
            !addressForm.city ||
            !addressForm.state ||
            !addressForm.pincode
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsSaving(true);
            if (editingAddress) {
                const response = await api.put(
                    `/api/admin/delhivery/pickup-addresses/${editingAddress.id}`,
                    addressForm
                );
                if (response.data.success) {
                    toast.success("Address updated");
                    if (response.data.data?.syncWarning) {
                        toast.info(response.data.data.syncWarning);
                    }
                }
            } else {
                const response = await api.post("/api/admin/delhivery/pickup-addresses", addressForm);
                if (response.data.success) {
                    toast.success("Address created");
                    if (response.data.data?.syncWarning) {
                        toast.info(response.data.data.syncWarning);
                    }
                }
            }

            fetchPickupAddresses();
            setIsAddressDialogOpen(false);
            setEditingAddress(null);
            resetAddressForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save address");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncAddress = async (id: string) => {
        try {
            setSyncingId(id);
            const response = await api.post(`/api/admin/delhivery/pickup-addresses/${id}/sync`);
            if (response.data.success) {
                toast.success("Warehouse synced to Delhivery");
                fetchPickupAddresses();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to sync warehouse to Delhivery");
        } finally {
            setSyncingId(null);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const response = await api.delete(`/api/admin/delhivery/pickup-addresses/${id}`);
            if (response.data.success) {
                toast.success("Address deleted");
                fetchPickupAddresses();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete address");
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            nickname: "Primary Warehouse",
            name: "",
            email: "",
            phone: "",
            address: "",
            address2: "",
            city: "",
            state: "",
            country: "India",
            pincode: "",
            isDefault: true,
        });
    };

    const openEditDialog = (address: PickupAddress) => {
        setEditingAddress(address);
        setAddressForm({
            nickname: address.nickname,
            name: address.name,
            email: address.email,
            phone: address.phone,
            address: address.address,
            address2: address.address2 || "",
            city: address.city,
            state: address.state,
            country: address.country,
            pincode: address.pincode,
            isDefault: address.isDefault,
        });
        setIsAddressDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4CAF50]" />
                    <p className="mt-4 text-base text-[#9CA3AF]">Loading Delhivery settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#1F2937] tracking-tight">
                        Delhivery Settings
                    </h1>
                    <p className="text-[#9CA3AF] text-sm mt-1.5">
                        Configure the Delhivery courier integration for order fulfillment
                    </p>
                </div>
                <div className="h-px bg-[#E5E7EB]" />
            </div>

            {/* Default Courier */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-[#4CAF50]" />
                        Default Courier
                    </CardTitle>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Which courier auto-syncs new orders. You can still choose a different courier
                        for an individual order from its order details page.
                    </p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["SHIPROCKET", "DELHIVERY"].map((provider) => (
                            <div
                                key={provider}
                                className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                                    defaultCourierProvider === provider
                                        ? "border-[#22C55E] bg-[#ECFDF5]"
                                        : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                                }`}
                                onClick={() => !isSavingDefaultCourier && handleSaveDefaultCourier(provider)}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            defaultCourierProvider === provider
                                                ? "border-[#22C55E] bg-[#22C55E]"
                                                : "border-[#D1D5DB]"
                                        }`}
                                    >
                                        {defaultCourierProvider === provider && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-[#1F2937]">
                                        {provider === "SHIPROCKET" ? "Shiprocket" : "Delhivery"}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Enable/Disable Toggle */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF] border border-[#DBEAFE]">
                                <Truck className="h-6 w-6 text-[#3B82F6]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold text-[#1F2937]">
                                        Enable Delhivery Integration
                                    </Label>
                                    {settings?.isEnabled && <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />}
                                </div>
                                <p className="text-sm text-[#9CA3AF]">
                                    Turn on to allow orders to be shipped through Delhivery
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings?.isEnabled || false} onCheckedChange={handleToggle} disabled={isSaving} />
                    </div>
                </CardContent>
            </Card>

            {/* API Credentials */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                        <Package className="h-5 w-5 mr-2 text-[#4CAF50]" />
                        API Credentials
                    </CardTitle>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Delhivery authenticates every request with a single static API token — no login step
                    </p>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Your Delhivery client name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiToken">API Token *</Label>
                            <div className="relative">
                                <Input
                                    id="apiToken"
                                    type={showToken ? "text" : "password"}
                                    value={apiToken}
                                    onChange={(e) => setApiToken(e.target.value)}
                                    placeholder="Paste your Delhivery API token"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
                        <AlertCircle className="h-5 w-5 text-[#D97706] mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-[#92400E]">
                            <p className="font-medium mb-1">How to get your API token</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Log in to your Delhivery One / seller dashboard</li>
                                <li>Go to API Settings and generate an API token</li>
                                <li>Paste it here and click Test Connection</li>
                            </ol>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleTestConnection} disabled={isTesting || !apiToken}>
                            {isTesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Test Connection
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Default Shipping Dimensions */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                        <Package className="h-5 w-5 mr-2 text-[#4CAF50]" />
                        Default Shipping Dimensions
                    </CardTitle>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Fallback dimensions used when a product variant doesn't specify its own
                    </p>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="length">Length (cm)</Label>
                            <Input
                                id="length"
                                type="number"
                                value={defaultLength}
                                onChange={(e) => setDefaultLength(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="breadth">Breadth (cm)</Label>
                            <Input
                                id="breadth"
                                type="number"
                                value={defaultBreadth}
                                onChange={(e) => setDefaultBreadth(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={defaultHeight}
                                onChange={(e) => setDefaultHeight(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                value={defaultWeight}
                                onChange={(e) => setDefaultWeight(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSaveDimensions} disabled={isSavingDimensions}>
                            {isSavingDimensions ? (
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

            {/* Shipment Booking Mode */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                        <Package className="h-5 w-5 mr-2 text-[#4CAF50]" />
                        Shipment Booking Mode
                    </CardTitle>
                    <p className="text-sm text-[#9CA3AF] mt-1">Choose how shipments are created in Delhivery</p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                                bookingMode === "AUTO"
                                    ? "border-[#22C55E] bg-[#ECFDF5]"
                                    : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                            }`}
                            onClick={() => setBookingMode("AUTO")}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        bookingMode === "AUTO" ? "border-[#22C55E] bg-[#22C55E]" : "border-[#D1D5DB]"
                                    }`}
                                >
                                    {bookingMode === "AUTO" && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1F2937]">Auto (Recommended)</h3>
                                    <p className="text-sm text-[#6B7280] mt-1">
                                        Shipments are automatically created in Delhivery when a customer places an
                                        order and Delhivery is the default courier. A waybill is assigned automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                                bookingMode === "MANUAL"
                                    ? "border-[#22C55E] bg-[#ECFDF5]"
                                    : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                            }`}
                            onClick={() => setBookingMode("MANUAL")}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        bookingMode === "MANUAL" ? "border-[#22C55E] bg-[#22C55E]" : "border-[#D1D5DB]"
                                    }`}
                                >
                                    {bookingMode === "MANUAL" && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1F2937]">Manual</h3>
                                    <p className="text-sm text-[#6B7280] mt-1">
                                        Shipments are NOT created automatically. You book each shipment manually
                                        from the order details page when ready to ship.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4 border-t border-[#E5E7EB]">
                        <Button onClick={handleSaveBookingMode} disabled={isSavingBookingMode}>
                            {isSavingBookingMode ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Booking Mode"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pickup Addresses */}
            <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
                <CardHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-[#1F2937] flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-[#4CAF50]" />
                                Pickup Addresses
                            </CardTitle>
                            <p className="text-sm text-[#9CA3AF] mt-1">
                                Warehouses Delhivery picks up shipments from
                            </p>
                        </div>
                        <Dialog
                            open={isAddressDialogOpen}
                            onOpenChange={(open) => {
                                setIsAddressDialogOpen(open);
                                if (!open) {
                                    setEditingAddress(null);
                                    resetAddressForm();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Address
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>{editingAddress ? "Edit Pickup Address" : "Add Pickup Address"}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nickname</Label>
                                        <Input
                                            value={addressForm.nickname}
                                            onChange={(e) => setAddressForm({ ...addressForm, nickname: e.target.value })}
                                            placeholder="e.g. Primary Warehouse"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Contact Name *</Label>
                                            <Input
                                                value={addressForm.name}
                                                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input
                                                value={addressForm.email}
                                                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone *</Label>
                                        <Input
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address *</Label>
                                        <Input
                                            value={addressForm.address}
                                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address Line 2</Label>
                                        <Input
                                            value={addressForm.address2}
                                            onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>City *</Label>
                                            <Input
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State *</Label>
                                            <Input
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pincode *</Label>
                                        <Input
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={addressForm.isDefault}
                                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                        />
                                        <Label htmlFor="isDefault">Set as default warehouse</Label>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveAddress} disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : editingAddress ? (
                                                "Update Address"
                                            ) : (
                                                "Add Address"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    {pickupAddresses.length === 0 ? (
                        <div className="text-center py-10 text-[#9CA3AF]">
                            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
                            <p>No pickup addresses configured yet</p>
                            <p className="text-sm">Add a warehouse to start shipping via Delhivery</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pickupAddresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-xl"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-[#1F2937]">{address.nickname}</h4>
                                            {address.isDefault && (
                                                <span className="text-xs bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE] px-2 py-0.5 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                            {address.delhiveryRegistered ? (
                                                <span className="text-xs bg-[#ECFDF5] text-[#22C55E] border border-[#D1FAE5] px-2 py-0.5 rounded-full">
                                                    Synced
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] px-2 py-0.5 rounded-full">
                                                    Not Synced
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#6B7280] mt-1">
                                            {address.name} · {address.address}, {address.city}, {address.state} -{" "}
                                            {address.pincode}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.delhiveryRegistered && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSyncAddress(address.id)}
                                                disabled={syncingId === address.id}
                                            >
                                                {syncingId === address.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(address)}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-[#EF4444] hover:bg-[#FEF2F2]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
