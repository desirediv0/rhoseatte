import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { customerUsers, products as productsApi, orders } from "@/api/adminService";
import { formatCurrency } from "@/lib/utils";

interface OrphanedPayment {
    paymentId: string;
    orderId: string;
    amount: number;
    email?: string;
    contact?: string;
}

interface Props {
    payment: OrphanedPayment;
    open: boolean;
    onClose: () => void;
    onRecovered: () => void;
}

export default function RecoverPaymentModal({ payment, open, onClose, onRecovered }: Props) {
    // Step 1: find the customer
    const [userSearch, setUserSearch] = useState(payment.email || "");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    // Step 2: their address
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Step 3: items
    const [productSearch, setProductSearch] = useState("");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [selectedItems, setSelectedItems] = useState<
        { variantId: string; label: string; price: number; quantity: number }[]
    >([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearchUsers = async () => {
        if (!userSearch.trim()) return;
        setIsSearchingUsers(true);
        try {
            const response = await customerUsers.getUsers({ search: userSearch.trim(), limit: 10 });
            if (response.data?.success) {
                setUserResults(response.data.data?.users || []);
            }
        } catch (error) {
            toast.error("Failed to search users");
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleSelectUser = async (user: any) => {
        setSelectedUser(user);
        setUserResults([]);
        setSelectedAddressId("");
        setIsLoadingAddresses(true);
        try {
            const response = await customerUsers.getUserAddresses(user.id);
            if (response.data?.success) {
                const list = response.data.data?.addresses || [];
                setAddresses(list);
                const def = list.find((a: any) => a.isDefault) || list[0];
                if (def) setSelectedAddressId(def.id);
            }
        } catch (error) {
            toast.error("Failed to load this customer's addresses");
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleSearchProducts = async () => {
        if (!productSearch.trim()) return;
        setIsSearchingProducts(true);
        try {
            const response = await productsApi.getProducts({ search: productSearch.trim(), limit: 10 });
            if (response.data?.success) {
                setProductResults(response.data.data?.products || []);
            }
        } catch (error) {
            toast.error("Failed to search products");
        } finally {
            setIsSearchingProducts(false);
        }
    };

    const addItem = (variant: any, productName: string) => {
        const attrs = (variant.attributes || [])
            .map((a: any) => a.attributeValue?.value)
            .filter(Boolean)
            .join(", ");
        const label = attrs ? `${productName} (${attrs})` : productName;
        const price = parseFloat(variant.salePrice || variant.price || 0);

        setSelectedItems((prev) => {
            const existing = prev.find((i) => i.variantId === variant.id);
            if (existing) {
                return prev.map((i) =>
                    i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { variantId: variant.id, label, price, quantity: 1 }];
        });
    };

    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems((prev) =>
            prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
        );
    };

    const removeItem = (variantId: string) => {
        setSelectedItems((prev) => prev.filter((i) => i.variantId !== variantId));
    };

    const itemsTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = Math.max(0, payment.amount - itemsTotal);

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Select the customer first");
            return;
        }
        if (!selectedAddressId) {
            toast.error("Select a shipping address");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Add at least one item");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await orders.recoverOrphanedPayment({
                razorpayPaymentId: payment.paymentId,
                userId: selectedUser.id,
                shippingAddressId: selectedAddressId,
                items: selectedItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
                shippingCost: shippingCost > 0 ? shippingCost : 0,
                notes: `Recovered via admin tool from payment ${payment.paymentId}`,
            });
            if (response.data?.success) {
                toast.success(`Order ${response.data.data.order.orderNumber} created and confirmation email sent`);
                onRecovered();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to recover this payment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Recover Payment {payment.paymentId}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm">
                        <p><span className="text-[#9CA3AF]">Amount paid:</span> <span className="font-semibold">{formatCurrency(payment.amount)}</span></p>
                        {payment.email && <p><span className="text-[#9CA3AF]">Razorpay email:</span> {payment.email}</p>}
                        {payment.contact && <p><span className="text-[#9CA3AF]">Razorpay contact:</span> {payment.contact}</p>}
                    </div>

                    {/* Step 1: Customer */}
                    <div className="space-y-2">
                        <Label>1. Find the customer</Label>
                        {selectedUser ? (
                            <div className="flex items-center justify-between p-3 border border-[#22C55E] bg-[#ECFDF5] rounded-lg">
                                <div className="text-sm">
                                    <p className="font-medium">{selectedUser.name}</p>
                                    <p className="text-[#6B7280]">{selectedUser.email}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <Input
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Search by name or email"
                                        onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                                    />
                                    <Button variant="outline" onClick={handleSearchUsers} disabled={isSearchingUsers}>
                                        {isSearchingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {userResults.length > 0 && (
                                    <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6] max-h-48 overflow-y-auto">
                                        {userResults.map((u) => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => handleSelectUser(u)}
                                                className="w-full text-left p-2.5 text-sm hover:bg-[#F9FAFB]"
                                            >
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-[#6B7280] text-xs">{u.email}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Step 2: Address */}
                    {selectedUser && (
                        <div className="space-y-2">
                            <Label>2. Shipping address</Label>
                            {isLoadingAddresses ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : addresses.length === 0 ? (
                                <p className="text-sm text-[#9CA3AF]">This customer has no saved addresses.</p>
                            ) : (
                                <select
                                    value={selectedAddressId}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    {addresses.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} — {a.street}, {a.city}, {a.state} {a.postalCode}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Step 3: Items */}
                    {selectedUser && selectedAddressId && (
                        <div className="space-y-2">
                            <Label>3. What did they order?</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search products"
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchProducts()}
                                />
                                <Button variant="outline" onClick={handleSearchProducts} disabled={isSearchingProducts}>
                                    {isSearchingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                            {productResults.length > 0 && (
                                <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6] max-h-48 overflow-y-auto">
                                    {productResults.map((p) => (
                                        <div key={p.id} className="p-2.5">
                                            <p className="text-sm font-medium mb-1">{p.name}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(p.variants || []).map((v: any) => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => addItem(v, p.name)}
                                                        className="text-xs px-2 py-1 border border-[#E5E7EB] rounded-md hover:border-[#22C55E] hover:bg-[#ECFDF5] flex items-center gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        {(v.attributes || []).map((a: any) => a.attributeValue?.value).filter(Boolean).join(", ") || "Default"}
                                                        {" "}({formatCurrency(parseFloat(v.salePrice || v.price || 0))})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedItems.length > 0 && (
                                <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6] mt-2">
                                    {selectedItems.map((item) => (
                                        <div key={item.variantId} className="flex items-center justify-between p-2.5 text-sm">
                                            <span className="flex-1">{item.label}</span>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value) || 1)}
                                                className="w-16 h-8 text-center"
                                            />
                                            <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.variantId)}>
                                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedItems.length > 0 && (
                                <div className="text-sm p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg space-y-1">
                                    <div className="flex justify-between"><span>Items total</span><span>{formatCurrency(itemsTotal)}</span></div>
                                    <div className="flex justify-between"><span>Shipping (remainder)</span><span>{formatCurrency(shippingCost)}</span></div>
                                    <div className="flex justify-between font-semibold border-t border-[#E5E7EB] pt-1">
                                        <span>Order total</span><span>{formatCurrency(payment.amount)}</span>
                                    </div>
                                    {Math.abs(itemsTotal - payment.amount) > 5 && (
                                        <p className="text-[11px] text-amber-600">
                                            Items total doesn't closely match the amount paid — double-check before submitting.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating order...
                                </>
                            ) : (
                                "Create Order & Send Confirmation"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
