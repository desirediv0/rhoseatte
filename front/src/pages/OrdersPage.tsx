import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { orders } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Truck,
  ExternalLink,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import RecoverPaymentModal from "@/components/RecoverPaymentModal";

export default function OrdersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ordersList, setOrdersList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  // True once the first fetch has finished. The full-page spinner is only for
  // that first load — after it, a search/filter/page change keeps the page
  // (and the search box) mounted and just refreshes the list in place.
  const hasLoadedOnce = useRef(false);
  // Bumped to re-run the fetch with unchanged params (the "try again" button).
  const [reloadKey, setReloadKey] = useState(0);

  // Page, search and filters live in the URL (?page=2&search=abc&status=SHIPPED
  // &payment=COD) so back/forward, refresh and shared links all restore the
  // exact same view.
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const selectedStatus = searchParams.get("status") || "";
  const selectedPayment = searchParams.get("payment") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

  // Apply several param changes in ONE navigation. Changing a filter/search
  // also drops back to page 1; going to another page leaves the rest alone.
  // (Separate setSearchParams calls in a row would each start from the same
  // stale params and overwrite one another, hence one combined update.)
  const paramsRef = useRef(searchParams);
  paramsRef.current = searchParams;
  const updateParams = (
    updates: Record<string, string | null>,
    options: { resetPage?: boolean } = { resetPage: true }
  ) => {
    // Built from the latest params (not the render this closure came from),
    // so a debounced search can't overwrite a filter changed in the meantime.
    const next = new URLSearchParams(paramsRef.current);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (options.resetPage) next.delete("page");
    setSearchParams(next);
  };

  const setSelectedStatus = (value: string) => updateParams({ status: value || null });
  const setSelectedPayment = (value: string) => updateParams({ payment: value || null });
  const goToPage = (page: number) => {
    updateParams({ page: page > 1 ? String(page) : null }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The search box is typed into freely; the URL (and so the API call) only
  // follows 400ms after the last keystroke instead of on every character.
  const [searchInput, setSearchInput] = useState(searchQuery);
  const lastPushedSearch = useRef(searchQuery);
  useEffect(() => {
    // Back/forward or "clear filters" changed the URL — mirror it in the box.
    // Skipped when the change is our own debounced push, otherwise the box
    // would snap back and eat characters typed while that push was landing.
    if (searchQuery === lastPushedSearch.current) return;
    lastPushedSearch.current = searchQuery;
    setSearchInput(searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) return;
    const timer = setTimeout(() => {
      lastPushedSearch.current = trimmed;
      updateParams({ search: trimmed || null });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Month-wise bulk invoice download (all paid orders in the chosen month)
  const now = new Date();
  const [invoiceMonth, setInvoiceMonth] = useState(now.getMonth() + 1);
  const [invoiceYear, setInvoiceYear] = useState(now.getFullYear());
  const [isDownloadingBulkInvoices, setIsDownloadingBulkInvoices] = useState(false);

  // Reconciliation: find Razorpay payments that were captured but have no
  // matching order in our DB (e.g. server crash / empty-cart race during
  // payment verification — the customer's money was taken but no order
  // exists here).
  const [isCheckingPayments, setIsCheckingPayments] = useState(false);
  const [orphanedPayments, setOrphanedPayments] = useState<any[] | null>(null);
  const [recoveringPayment, setRecoveringPayment] = useState<any | null>(null);

  // Filter-pill counts — fetched once from the server across ALL orders, not
  // just the current page, so "Processing (9)" etc. reflect the true total
  // instead of going stale/misleading (e.g. showing 0 when the current page
  // happens to have none, even though other pages do).
  const [filterCounts, setFilterCounts] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byPayment: { COD: number; PREPAID: number };
  }>({ total: 0, byStatus: {}, byPayment: { COD: 0, PREPAID: 0 } });

  const fetchFilterCounts = useCallback(async () => {
    try {
      const response = await orders.getOrderFilterCounts();
      if (response.data?.success) {
        setFilterCounts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching order filter counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchFilterCounts();
  }, [fetchFilterCounts]);

  // Fetch orders
  useEffect(() => {
    // If the params change again before this request returns, its response
    // is stale and must not overwrite the newer results (typing "ab" then
    // "abc" quickly could otherwise land the "ab" results last).
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = {
          page: currentPage,
          limit: 10,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedStatus && { status: selectedStatus }),
          ...(selectedPayment && { paymentMethod: selectedPayment }),
        };

        const response = await orders.getOrders(params);
        if (cancelled) return;

        if (response && response.data && response.data.success) {
          hasLoadedOnce.current = true;
          setOrdersList(response.data.data?.orders || []);
          setTotalPages(response.data.data?.pagination?.pages || 1);
          setTotalCount(response.data.data?.pagination?.total || 0);
        } else {
          setError(response.data?.message || t('orders.actions.load_error'));
        }
      } catch (error: any) {
        if (cancelled) return;
        console.error("Error fetching orders:", error);
        setError(t('orders.actions.load_error'));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, selectedStatus, selectedPayment, reloadKey, t]);

  // A stale/bookmarked ?page= past the last page (e.g. after a filter shrank
  // the results) would show an empty list with no pagination to escape it.
  useEffect(() => {
    if (!isLoading && totalPages >= 1 && currentPage > totalPages) {
      goToPage(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, totalPages, currentPage]);

  // Enter applies the search immediately instead of waiting for the debounce.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed !== searchQuery) {
      lastPushedSearch.current = trimmed;
      updateParams({ search: trimmed || null });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-[#FFFBEB] text-[#F59E0B] border-[#FEF3C7]";
      case "PROCESSING":
        return "bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]";
      case "SHIPPED":
        return "bg-[#EEF2FF] text-[#6366F1] border-[#E0E7FF]";
      case "DELIVERED":
        return "bg-[#ECFDF5] text-[#22C55E] border-[#D1FAE5]";
      case "CANCELLED":
        return "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
      case "REFUNDED":
        return "bg-[#F3E8FF] text-[#A855F7] border-[#E9D5FF]";
      case "RETURN_APPROVED":
        return "bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]";
      case "RETURN_COMPLETED":
        return "bg-[#F0FDFA] text-[#14B8A6] border-[#CCFBF1]";
      default:
        return "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return t('orders.status.pending');
      case "PROCESSING": return t('orders.status.processing');
      case "SHIPPED": return t('orders.status.shipped');
      case "DELIVERED": return t('orders.status.delivered');
      case "CANCELLED": return t('orders.status.cancelled');
      case "REFUNDED": return t('orders.status.refunded');
      case "PAID": return t('orders.status.paid');
      case "RETURN_APPROVED": return t('orders.status.return_approved') || "Return Approved";
      case "RETURN_COMPLETED": return t('orders.status.return_completed') || "Return Completed";
      default: return status;
    }
  };

  // Which courier (if any) fulfilled this order, and its tracking info —
  // works with both Shiprocket and Delhivery without mixing their data.
  const getShipmentInfo = (order: any) => {
    if (order.delhivery?.waybill) {
      return {
        provider: "Delhivery",
        trackingCode: order.delhivery.waybill,
        trackingUrl: `https://www.delhivery.com/track/package/${order.delhivery.waybill}`,
        courierName: "Delhivery",
        status: order.delhivery.status,
        warehouseNickname: order.delhivery.warehouseNickname,
        warehouseAssignedBy: order.delhivery.warehouseAssignedBy,
      };
    }
    if (order.shiprocket?.awbCode || order.shiprocket?.orderId) {
      return {
        provider: "Shiprocket",
        trackingCode: order.shiprocket.awbCode,
        trackingUrl: order.shiprocket.awbCode
          ? `https://shiprocket.co/tracking/${order.shiprocket.awbCode}`
          : null,
        courierName: order.shiprocket.courierName,
        status: order.shiprocket.status,
        warehouseNickname: order.shiprocket.warehouseNickname,
        warehouseAssignedBy: order.shiprocket.warehouseAssignedBy,
      };
    }
    return null;
  };

  const clearFilters = () => {
    lastPushedSearch.current = "";
    setSearchInput("");
    updateParams({ search: null, status: null, payment: null });
  };

  // Download invoices (as a ZIP) for every paid order placed in the chosen month
  const handleDownloadBulkInvoices = async () => {
    setIsDownloadingBulkInvoices(true);
    try {
      const response = await orders.downloadBulkInvoices(invoiceMonth, invoiceYear);
      const blob = new Blob([response.data], { type: "application/zip" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `invoices-${invoiceYear}-${String(invoiceMonth).padStart(2, "0")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      toast.success("Invoices downloaded");
    } catch (error: any) {
      // The error body also comes back as a Blob (since responseType is
      // "blob"), so the JSON message has to be read out of it explicitly.
      let message = "Failed to download invoices for that month";
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          /* keep default message */
        }
      } else if (data?.message) {
        message = data.message;
      }
      toast.error(message);
    } finally {
      setIsDownloadingBulkInvoices(false);
    }
  };

  const handleCheckOrphanedPayments = async () => {
    setIsCheckingPayments(true);
    try {
      const response = await orders.reconcilePayments(7);
      if (response.data?.success) {
        setOrphanedPayments(response.data.data.orphaned || []);
        if ((response.data.data.orphaned || []).length === 0) {
          toast.success("No missing orders found in the last 7 days");
        } else {
          toast.error(`${response.data.data.orphaned.length} payment(s) have no matching order`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check for missing orders");
    } finally {
      setIsCheckingPayments(false);
    }
  };

  // Full-page spinner only for the very first load. Afterwards a search,
  // filter or page change refreshes the list in place — swapping the whole
  // page for a spinner would unmount the search box mid-typing.
  if (isLoading && !hasLoadedOnce.current) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#4CAF50]" />
          <p className="mt-4 text-base text-[#9CA3AF]">{t('partners_tab.common.loading').replace('Partners', 'orders').replace('partners', 'orders').replace('Partner', 'Orders').replace('partner', 'orders')}</p>
        </div>
      </div>
    );
  }

  // Full-page error only if the first load never succeeded; later failures
  // are shown as an inline banner above the list instead.
  if (error && !hasLoadedOnce.current) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FEF2F2] mb-4">
          <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1F2937] mb-1.5">
          {t('reviews.messages.error_title')}
        </h2>
        <p className="text-center text-[#9CA3AF] mb-6">{error}</p>
        <Button
          variant="outline"
          className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9]"
          onClick={() => {
            setError(null);
            setIsLoading(true);
            setReloadKey((k) => k + 1);
          }}
        >
          {t('reviews.messages.try_again')}
        </Button>
      </div>
    );
  }

  const deliveredCount = filterCounts.byStatus.DELIVERED || 0;
  const pendingCount = filterCounts.byStatus.PENDING || 0;
  const processingCount = filterCounts.byStatus.PROCESSING || 0;
  const shippedCount = filterCounts.byStatus.SHIPPED || 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Premium Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1F2937] tracking-tight">
              {t('orders.title')}
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1.5">
              {t('orders.description')}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-2 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-[#4B5563]" />
              <span className="font-semibold text-[#1F2937]">{filterCounts.total || totalCount}</span>
              <span className="text-[#9CA3AF] hidden xs:inline">{t('orders.summary.total')}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#ECFDF5] px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              <span className="font-semibold text-[#22C55E]">{deliveredCount}</span>
              <span className="text-[#22C55E] hidden xs:inline">{t('orders.summary.delivered')}</span>
            </div>
          </div>
        </div>
        <div className="h-px bg-[#E5E7EB]" />
      </div>

      {/* Filters Bar */}
      <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder={t('orders.filters.search_placeholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-primary"
              />
            </form>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] text-sm text-[#4B5563] focus:border-primary focus:outline-none"
              >
                <option value="">{t('orders.filters.all_status')}</option>
                <option value="PENDING">{t('orders.status.pending')}</option>
                <option value="PROCESSING">{t('orders.status.processing')}</option>
                <option value="SHIPPED">{t('orders.status.shipped')}</option>
                <option value="DELIVERED">{t('orders.status.delivered')}</option>
                <option value="CANCELLED">{t('orders.status.cancelled')}</option>
                <option value="REFUNDED">{t('orders.status.refunded')}</option>
                <option value="RETURN_APPROVED">{t('orders.status.return_approved') || "Return Approved"}</option>
                <option value="RETURN_COMPLETED">{t('orders.status.return_completed') || "Return Completed"}</option>
              </select>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] text-sm text-[#4B5563] focus:border-primary focus:outline-none"
              >
                <option value="">{t('orders.filters.all_payments')}</option>
                <option value="COD">{t('orders.filters.cod')}</option>
                <option value="PREPAID">{t('orders.filters.prepaid')}</option>
              </select>
            </div>
            {(searchInput || searchQuery || selectedStatus || selectedPayment) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-[#4B5563] hover:text-[#1F2937] shrink-0"
              >
                {t('orders.filters.clear')}
              </Button>
            )}
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { status: "PENDING", count: pendingCount, label: t('orders.status.pending') },
              { status: "PROCESSING", count: processingCount, label: t('orders.status.processing') },
              { status: "SHIPPED", count: shippedCount, label: t('orders.status.shipped') },
              { status: "DELIVERED", count: deliveredCount, label: t('orders.status.delivered') },
            ].map(({ status, count, label }) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs",
                  selectedStatus === status
                    ? ""
                    : "border-[#E5E7EB] hover:bg-[#F3F7F6]"
                )}
                onClick={() => setSelectedStatus(selectedStatus === status ? "" : status)}
              >
                {label} ({count})
              </Button>
            ))}
            <div className="w-px h-9 bg-[#E5E7EB] mx-1 hidden sm:block" />
            {[
              { value: "COD", label: t('orders.filters.cod'), count: filterCounts.byPayment.COD },
              { value: "PREPAID", label: t('orders.filters.prepaid'), count: filterCounts.byPayment.PREPAID },
            ].map(({ value, label, count }) => (
              <Button
                key={value}
                variant={selectedPayment === value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 text-xs",
                  selectedPayment === value
                    ? ""
                    : "border-[#E5E7EB] hover:bg-[#F3F7F6]"
                )}
                onClick={() => setSelectedPayment(selectedPayment === value ? "" : value)}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Invoice Download */}
      <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#4B5563] shrink-0">
              <Download className="h-4 w-4 text-[#4B5563]" />
              <span className="font-medium">Bulk Invoices</span>
            </div>
            <div className="flex flex-1 gap-2">
              <select
                value={invoiceMonth}
                onChange={(e) => setInvoiceMonth(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] text-sm text-[#4B5563] focus:border-primary focus:outline-none"
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December",
                ].map((label, idx) => (
                  <option key={label} value={idx + 1}>{label}</option>
                ))}
              </select>
              <select
                value={invoiceYear}
                onChange={(e) => setInvoiceYear(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] text-sm text-[#4B5563] focus:border-primary focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBulkInvoices}
              disabled={isDownloadingBulkInvoices}
              className="border-[#E5E7EB] hover:bg-[#F3F7F6] shrink-0"
            >
              {isDownloadingBulkInvoices ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing ZIP...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoices (ZIP)
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-2">
            Downloads one invoice per paid order placed that month (excludes pending and cancelled orders).
          </p>
        </CardContent>
      </Card>

      {/* Payment Reconciliation — catches Razorpay payments captured with no matching order */}
      <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#4B5563] flex-1">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-medium">Missing Orders Check</span>
              <span className="text-[#9CA3AF] text-xs hidden sm:inline">
                — find payments Razorpay captured that have no order here (last 7 days)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckOrphanedPayments}
              disabled={isCheckingPayments}
              className="border-[#E5E7EB] hover:bg-[#F3F7F6] shrink-0"
            >
              {isCheckingPayments ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Now"
              )}
            </Button>
          </div>

          {orphanedPayments !== null && orphanedPayments.length > 0 && (
            <div className="mt-4 border border-red-200 bg-red-50/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-red-700">
                {orphanedPayments.length} payment(s) were captured by Razorpay but have no matching order — the customer's money was taken but no order exists. Contact them and create the order manually or refund from the Razorpay dashboard.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[#6B7280] border-b border-red-200">
                      <th className="py-1.5 pr-3">Payment ID</th>
                      <th className="py-1.5 pr-3">Amount</th>
                      <th className="py-1.5 pr-3">Email</th>
                      <th className="py-1.5 pr-3">Contact</th>
                      <th className="py-1.5 pr-3">Date</th>
                      <th className="py-1.5 pr-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orphanedPayments.map((p) => (
                      <tr key={p.paymentId} className="border-b border-red-100 last:border-0">
                        <td className="py-1.5 pr-3 font-mono">{p.paymentId}</td>
                        <td className="py-1.5 pr-3">{formatCurrency(p.amount)}</td>
                        <td className="py-1.5 pr-3">{p.email || "—"}</td>
                        <td className="py-1.5 pr-3">{p.contact || "—"}</td>
                        <td className="py-1.5 pr-3">{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                        <td className="py-1.5 pr-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
                            onClick={() => setRecoveringPayment(p)}
                          >
                            Recover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Later fetch failures (search/filter/page) show here rather than
          replacing the whole page, so the search box stays usable. */}
      {error && hasLoadedOnce.current && (
        <div className="flex items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 shrink-0"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            {t('reviews.messages.try_again')}
          </Button>
        </div>
      )}

      {isLoading && hasLoadedOnce.current && (
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating results…
        </div>
      )}

      {/* Orders List */}
      {ordersList.length === 0 ? (
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3F4F6] mb-4">
              <ShoppingCart className="h-8 w-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-1.5">
              {t('orders.list.no_orders')}
            </h3>
            <p className="text-sm text-[#9CA3AF] mb-6 max-w-sm mx-auto">
              {selectedStatus
                ? t('orders.list.no_orders_status', { status: getStatusLabel(selectedStatus).toLowerCase() })
                : searchQuery
                  ? t('orders.list.try_adjusting')
                  : t('orders.list.empty_desc')}
            </p>
            {(selectedStatus || searchQuery || selectedPayment) && (
              <Button
                variant="outline"
                className="border-[#E5E7EB] hover:bg-[#F3F7F6]"
                onClick={clearFilters}
              >
                {t('orders.filters.clear')}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop table (md and up) — sized to fit within the sidebar
              layout without forcing horizontal scroll; every row is a link
              (not just the tiny eye icon) so a click anywhere opens it. */}
          <Card className="hidden md:block bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[9%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[4%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">Order</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">{t('orders.list.customer')}</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">{t('orders.list.order_date')}</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">Status</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">Payment</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-3">Shipment</th>
                    <th className="text-right font-medium text-[#6B7280] px-3 py-3">{t('orders.list.total_amount')}</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order: any) => {
                    const shipment = getShipmentInfo(order);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9]">
                              <ShoppingCart className="h-4 w-4 text-[#2E7D32]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1F2937] truncate" title={order.orderNumber}>
                                #{order.orderNumber}
                              </p>
                              <p className="text-xs text-[#9CA3AF]">
                                {t('orders.list.items_count', { count: order.items?.length || 0 })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 min-w-0">
                          <p className="font-medium text-[#1F2937] truncate" title={order.user?.name || "Guest"}>
                            {order.user?.name || "Guest"}
                          </p>
                          <p className="text-xs text-[#9CA3AF] truncate" title={order.user?.email || "No email"}>
                            {order.user?.email || "No email"}
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-[#1F2937] text-xs">
                            <Calendar className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />
                            <span className="truncate">{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge className={cn("text-xs font-medium border", getStatusBadgeClass(order.status))}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge
                            className={cn(
                              "text-xs font-medium border",
                              order.paymentMethod === "CASH"
                                ? "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                                : "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                            )}
                          >
                            {order.paymentMethod === "CASH" ? t('orders.filters.cod') : t('orders.filters.prepaid')}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 min-w-0">
                          {shipment ? (
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs text-[#6B7280]">{shipment.provider}</span>
                              {shipment.trackingCode && shipment.trackingUrl ? (
                                <a
                                  href={shipment.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-mono text-xs font-medium text-[#22C55E] hover:underline flex items-center gap-1 truncate"
                                  title={shipment.trackingCode}
                                >
                                  <span className="truncate">{shipment.trackingCode}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-xs text-[#9CA3AF] truncate">
                                  {shipment.status ? shipment.status.replace(/_/g, " ") : "Pending"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#D1D5DB]">Not synced</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <p className="font-semibold text-[#1F2937] whitespace-nowrap">
                            {formatCurrency(
                              order.total || order.totalAmount ||
                              (parseFloat(order.subTotal || 0) +
                                parseFloat(order.shippingCost || 0) -
                                parseFloat(order.discount || 0))
                            )}
                          </p>
                          {parseFloat(order.discount || 0) > 0 && (
                            <p className="text-xs text-[#22C55E] whitespace-nowrap">
                              -{formatCurrency(parseFloat(order.discount))}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-[#F3F4F6]"
                            asChild
                            title={t('orders.actions.view_details')}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link to={`/orders/${order.id}`}>
                              <Eye className="h-4 w-4 text-[#4B5563]" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards (below md) */}
          <div className="md:hidden space-y-3">
            {ordersList.map((order: any) => {
              const shipment = getShipmentInfo(order);
              return (
                <Card
                  key={order.id}
                  className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9]">
                          <ShoppingCart className="h-4 w-4 text-[#2E7D32]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F2937] text-sm truncate">#{order.orderNumber}</p>
                          <p className="text-xs text-[#9CA3AF]">
                            {t('orders.list.items_count', { count: order.items?.length || 0 })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-[#F3F4F6]"
                        asChild
                      >
                        <Link to={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 text-[#4B5563]" />
                        </Link>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge className={cn("text-[10px] font-medium border", getStatusBadgeClass(order.status))}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border",
                          order.paymentMethod === "CASH"
                            ? "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                            : "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                        )}
                      >
                        {order.paymentMethod === "CASH" ? t('orders.filters.cod') : t('orders.filters.prepaid')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <p className="text-[#9CA3AF] mb-0.5">{t('orders.list.customer')}</p>
                        <p className="font-medium text-[#1F2937] truncate">{order.user?.name || "Guest"}</p>
                      </div>
                      <div>
                        <p className="text-[#9CA3AF] mb-0.5">{t('orders.list.order_date')}</p>
                        <div className="flex items-center gap-1 text-[#1F2937]">
                          <Calendar className="h-3 w-3 text-[#9CA3AF]" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    {shipment && (
                      <div className="mb-3 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Truck className="h-3.5 w-3.5 text-[#4CAF50]" />
                          <span className="text-[10px] font-medium text-[#1F2937]">{shipment.provider.toUpperCase()}</span>
                        </div>
                        {shipment.trackingCode && shipment.trackingUrl ? (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs font-medium text-[#22C55E] hover:underline flex items-center gap-1"
                          >
                            {shipment.trackingCode}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">
                            {shipment.status ? shipment.status.replace(/_/g, " ") : "Pending"}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-end justify-between pt-2 border-t border-[#F3F4F6]">
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">{t('orders.list.total_amount')}</p>
                        <p className="text-base font-semibold text-[#1F2937]">
                          {formatCurrency(
                            order.total || order.totalAmount ||
                            (parseFloat(order.subTotal || 0) +
                              parseFloat(order.shippingCost || 0) -
                              parseFloat(order.discount || 0))
                          )}
                        </p>
                      </div>
                      {parseFloat(order.discount || 0) > 0 && (
                        <p className="text-xs text-[#22C55E]">
                          -{formatCurrency(parseFloat(order.discount))}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
          <div className="text-sm text-[#9CA3AF]">
            {t("common.pagination", { current: currentPage, total: totalPages })}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E7EB] hover:bg-[#F3F7F6]"
              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Numbered pages: a window of up to 5 around the current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.min(
                Math.max(currentPage - 2, 1),
                Math.max(totalPages - 4, 1)
              );
              return start + i;
            }).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 min-w-9 px-2 text-xs hidden sm:inline-flex",
                  page !== currentPage && "border-[#E5E7EB] hover:bg-[#F3F7F6]"
                )}
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E7EB] hover:bg-[#F3F7F6]"
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {recoveringPayment && (
        <RecoverPaymentModal
          payment={recoveringPayment}
          open={!!recoveringPayment}
          onClose={() => setRecoveringPayment(null)}
          onRecovered={() => {
            setOrphanedPayments((prev) =>
              (prev || []).filter((p) => p.paymentId !== recoveringPayment.paymentId)
            );
            fetchFilterCounts();
          }}
        />
      )}
    </div>
  );
}
