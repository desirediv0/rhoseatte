"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { fetchApi, formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconEdit,
  IconCheck,
  IconX,
  IconMapPin,
  IconLock,
  IconUsers,
  IconCopy,
  IconLoader2,
  IconArrowRight,
  IconCoin,
  IconFlask
} from "@tabler/icons-react";

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", profileImage: null });
  const [addresses, setAddresses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState(null);
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", phone: user.phone || "", profileImage: null });
  }, [user]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const response = await fetchApi("/users/addresses", { credentials: "include" });
        setAddresses(response.data.addresses || []);
      } catch (error) { console.error("Failed to fetch addresses:", error); }
    };
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;
      try {
        setIsLoadingReferral(true);
        const response = await fetchApi("/referrals/my-code", { credentials: "include" });
        if (response.success) {
          setReferralCode(response.data.referralCode);
          setReferralStats(response.data.stats);
        }
      } catch (error) { console.error("Failed to fetch referral data:", error); }
      finally { setIsLoadingReferral(false); }
    };
    fetchReferralData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <ProtectedRoute>
      <ClientOnly>
        <div className="space-y-8">

          {/* Message */}
          {message.text && (
            <div className={`px-5 py-4 flex items-center gap-3 text-[13px] font-light ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message.type === "success" ? <IconCheck className="h-4 w-4 flex-shrink-0" stroke={2} /> : <IconX className="h-4 w-4 flex-shrink-0" stroke={2} />}
              {message.text}
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-white border border-line">
            <div className="px-6 py-5 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-lg text-noir tracking-tight">Profile Information</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-noir transition-colors">
                  <IconEdit className="h-3.5 w-3.5" stroke={1.5} /> Edit
                </button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Full Name</label>
                      <input
                        name="name" type="text" value={formData.name} onChange={handleChange}
                        className="w-full h-12 px-4 bg-ivory border border-line text-noir text-[13px] font-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Phone</label>
                      <input
                        name="phone" type="tel" value={formData.phone} onChange={handleChange}
                        className="w-full h-12 px-4 bg-ivory border border-line text-noir text-[13px] font-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: user?.name || "", phone: user?.phone || "", profileImage: null }); }}
                      className="px-6 h-10 border border-line text-stone text-[11px] uppercase tracking-[0.15em] font-medium hover:border-noir hover:text-noir transition-all duration-300">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="px-6 h-10 bg-noir text-ivory text-[11px] uppercase tracking-[0.15em] font-medium flex items-center gap-2 hover:bg-gold disabled:opacity-50 transition-all duration-500">
                      {isSubmitting ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" stroke={1.5} /> : null}
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-1.5">
                      <IconUser className="h-3 w-3" stroke={1.5} /> Full Name
                    </span>
                    <p className="text-[14px] text-noir font-light">{user?.name || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-1.5">
                      <IconMail className="h-3 w-3" stroke={1.5} /> Email
                    </span>
                    <p className="text-[14px] text-noir font-light">{user?.email || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-1.5">
                      <IconPhone className="h-3 w-3" stroke={1.5} /> Phone
                    </span>
                    <p className="text-[14px] text-noir font-light">{user?.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-1.5">
                      <IconCalendar className="h-3 w-3" stroke={1.5} /> Member Since
                    </span>
                    <p className="text-[14px] text-noir font-light">{user?.createdAt ? formatDate(user.createdAt) : "Unknown"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Perfume Bespoke Orders Section */}
          <CustomPerfumeOrdersSection />

          {/* Addresses */}
          <div className="bg-white border border-line">
            <div className="px-6 py-5 border-b border-line flex items-center justify-between">
              <h2 className="font-display text-lg text-noir tracking-tight">Saved Addresses</h2>
              <Link href="/account/addresses" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone hover:text-noir transition-colors">
                Manage <IconArrowRight className="h-3 w-3" stroke={1.5} />
              </Link>
            </div>
            <div className="p-6">
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.slice(0, 2).map((address) => (
                    <div key={address.id} className="flex items-start justify-between p-4 bg-ivory border border-line">
                      <div>
                        {address.isDefault && (
                          <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-medium bg-gold/10 px-2 py-0.5 mb-2 inline-block">Default</span>
                        )}
                        <p className="text-[13px] text-noir font-medium">{address.name || user?.name}</p>
                        <p className="text-[12px] text-stone font-light mt-0.5">{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                      </div>
                    </div>
                  ))}
                  {addresses.length > 2 && (
                    <p className="text-[12px] text-stone font-light">+ {addresses.length - 2} more</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-ivory border border-line">
                  <IconMapPin className="h-6 w-6 text-stone mx-auto mb-3" stroke={1.5} />
                  <p className="text-[13px] text-stone font-light mb-4">No addresses added yet</p>
                  <Link href="/account/addresses" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-noir hover:text-gold transition-colors font-medium">
                    Add Address <IconArrowRight className="h-3 w-3" stroke={1.5} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-white border border-line">
            <div className="px-6 py-5 border-b border-line">
              <div className="flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-gold" stroke={1.5} />
                <h2 className="font-display text-lg text-noir tracking-tight">Referral Program</h2>
              </div>
              <p className="text-[12px] text-stone font-light mt-1">Share your code with friends and earn rewards</p>
            </div>
            <div className="p-6">
              {isLoadingReferral ? (
                <div className="flex justify-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin text-gold" stroke={1.5} />
                </div>
              ) : (
                <>
                  <div className="p-4 bg-ivory border border-line mb-6">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone font-medium mb-2">Your Referral Code</label>
                    <div className="flex items-center gap-3">
                      <input value={referralCode} readOnly
                        className="flex-1 h-12 px-4 bg-white border border-line text-noir text-[14px] font-display tracking-wider focus:outline-none" />
                      <button onClick={() => { navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="h-12 px-5 bg-noir text-ivory text-[11px] uppercase tracking-[0.15em] font-medium flex items-center gap-2 hover:bg-gold transition-all duration-500">
                        {copied ? <><IconCheck className="h-3.5 w-3.5" stroke={1.5} /> Copied</> : <><IconCopy className="h-3.5 w-3.5" stroke={1.5} /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {referralStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Total Referrals", value: referralStats.totalReferrals || 0, color: "text-noir" },
                        { label: "Completed", value: referralStats.completedReferrals || 0, color: "text-green-600" },
                        { label: "Pending", value: referralStats.pendingReferrals || 0, color: "text-gold" },
                        { label: "Earnings", value: `₹${parseFloat(referralStats.totalEarnings || 0).toFixed(0)}`, color: "text-gold" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 bg-ivory border border-line text-center">
                          <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-stone mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-line">
            <div className="px-6 py-5 border-b border-line">
              <h2 className="font-display text-lg text-noir tracking-tight">Security</h2>
            </div>
            <div className="p-6">
              <Link href="/account/change-password"
                className="inline-flex items-center gap-2 px-6 h-12 border border-line text-noir text-[11px] uppercase tracking-[0.15em] font-medium hover:border-gold hover:text-gold transition-all duration-500">
                <IconLock className="h-4 w-4" stroke={1.5} /> Change Password
              </Link>
            </div>
          </div>

        </div>
      </ClientOnly>
    </ProtectedRoute>
  );
}

function CustomPerfumeOrdersSection() {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/custom-perfume-order/user-orders", { credentials: "include" });
      if (res.success && res.data) {
        setCustomOrders(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch custom perfume orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingOrder || !cancelReason.trim()) {
      return;
    }

    try {
      setIsSubmittingCancel(true);
      const res = await fetchApi(`/custom-perfume-order/user-orders/${cancellingOrder.id}/cancel`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ reason: cancelReason })
      });

      if (res.success) {
        setCancellingOrder(null);
        setCancelReason("");
        await fetchCustomOrders();
      }
    } catch (err) {
      console.error("Failed to cancel custom order:", err);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-line p-6 text-center">
        <IconLoader2 className="h-6 w-6 text-stone animate-spin mx-auto mb-2" stroke={1.5} />
        <p className="text-xs text-stone font-light">Loading Bespoke Perfume Orders...</p>
      </div>
    );
  }

  if (customOrders.length === 0) {
    return (
      <div className="bg-white border border-line">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconFlask className="h-4 w-4 text-gold" stroke={1.5} />
            <h2 className="font-display text-lg text-noir tracking-tight">Bespoke Custom Orders</h2>
          </div>
          <Link href="/custom-perfume" className="text-[11px] uppercase tracking-[0.15em] text-gold font-semibold hover:underline">
            Create Formula +
          </Link>
        </div>
        <div className="p-8 text-center bg-ivory">
          <IconFlask className="h-8 w-8 text-stone/50 mx-auto mb-3" stroke={1.5} />
          <p className="text-[13px] text-stone font-light mb-4">No custom bespoke perfume orders placed yet.</p>
          <Link href="/custom-perfume" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A2478] text-white text-[11px] uppercase tracking-[0.15em] font-semibold rounded-full hover:bg-[#38195E] transition-colors shadow-md">
            Design Custom Perfume (100ml) <IconArrowRight className="h-3 w-3" stroke={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line">
      <div className="px-6 py-5 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFlask className="h-4 w-4 text-gold" stroke={1.5} />
          <h2 className="font-display text-lg text-noir tracking-tight">Bespoke Custom Orders ({customOrders.length})</h2>
        </div>
        <Link href="/custom-perfume" className="text-[11px] uppercase tracking-[0.15em] text-gold font-semibold hover:underline">
          Create New Formula +
        </Link>
      </div>
      <div className="p-6 space-y-4">
        {customOrders.map((order) => (
          <div key={order.id} className="p-5 bg-ivory border border-line rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone block">ORDER NUMBER</span>
                <span className="font-mono font-bold text-noir text-sm">{order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                  order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.paymentStatus} (₹{parseFloat(order.amount).toLocaleString()})
                </span>
                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider ${
                  order.orderStatus === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-[#4A2478] text-white"
                }`}>
                  {order.orderStatus?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-noir uppercase text-[10px] tracking-wider block">Fragrance Formula Specs:</span>
                <p className="text-stone"><strong className="text-noir font-medium">Base:</strong> {order.baseNotes?.join(", ") || "None"}</p>
                <p className="text-stone"><strong className="text-noir font-medium">Heart:</strong> {order.heartNotes?.join(", ") || "None"}</p>
                <p className="text-stone"><strong className="text-noir font-medium">Top:</strong> {order.topNotes?.join(", ") || "None"}</p>
                <p className="text-stone"><strong className="text-noir font-medium">Bottle:</strong> {order.bottleSilhouette}</p>
                {order.monogramEngraving && (
                  <p className="text-[#4A2478] italic font-serif"><strong className="text-noir font-medium font-sans">Engraving:</strong> &quot;{order.monogramEngraving}&quot;</p>
                )}
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-line/60 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-noir uppercase text-[10px] tracking-wider block">Bespoke Progress:</span>
                  <p className="text-stone leading-relaxed font-light">
                    Our master perfumers create 3 sample variations of your formula. Once delivered, reply with your choice code for final 100ml flacon creation!
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs font-mono text-[#4A2478] font-bold pt-1">
                      Tracking #: {order.trackingNumber}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p className="text-xs text-red-600 italic pt-1">
                      Cancellation Reason: &quot;{order.cancelReason}&quot;
                    </p>
                  )}
                </div>

                {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
                  <div className="pt-2">
                    <button
                      onClick={() => setCancellingOrder(order)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Cancel Bespoke Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Order Modal with Reason */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmCancel} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="font-display text-lg text-noir">Cancel Order #{cancellingOrder.orderNumber}?</h3>
            <p className="text-xs text-stone">Please specify your reason for cancelling this bespoke perfume order:</p>
            
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full p-3 border border-line rounded-xl text-xs text-noir focus:outline-none focus:border-gold"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setCancellingOrder(null); setCancelReason(""); }}
                className="px-4 py-2 text-xs border rounded-lg text-stone hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmittingCancel}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider"
              >
                {isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
