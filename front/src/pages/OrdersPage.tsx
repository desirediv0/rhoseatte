import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function OrdersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ordersList, setOrdersList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

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
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: 10,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedStatus && { status: selectedStatus }),
          ...(selectedPayment && { paymentMethod: selectedPayment }),
        };

        const response = await orders.getOrders(params);

        if (response && response.data && response.data.success) {
          setOrdersList(response.data.data?.orders || []);
          setTotalPages(response.data.data?.pagination?.pages || 1);
          setTotalCount(response.data.data?.pagination?.total || 0);
        } else {
          setError(response.data?.message || t('orders.actions.load_error'));
        }
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(t('orders.actions.load_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, searchQuery, selectedStatus, selectedPayment, t]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
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
    setSelectedStatus("");
    setSelectedPayment("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading && ordersList.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#4CAF50]" />
          <p className="mt-4 text-base text-[#9CA3AF]">{t('partners_tab.common.loading').replace('Partners', 'orders').replace('partners', 'orders').replace('Partner', 'Orders').replace('partner', 'orders')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && ordersList.length === 0) {
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
            setCurrentPage(1);
            setIsLoading(true);
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-primary"
              />
            </form>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setSelectedPayment(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F7F6] text-sm text-[#4B5563] focus:border-primary focus:outline-none"
              >
                <option value="">{t('orders.filters.all_payments')}</option>
                <option value="COD">{t('orders.filters.cod')}</option>
                <option value="PREPAID">{t('orders.filters.prepaid')}</option>
              </select>
            </div>
            {(searchQuery || selectedStatus || selectedPayment) && (
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
                onClick={() => {
                  setSelectedStatus(selectedStatus === status ? "" : status);
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setSelectedPayment(selectedPayment === value ? "" : value);
                  setCurrentPage(1);
                }}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E7EB] hover:bg-[#F3F7F6]"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#E5E7EB] hover:bg-[#F3F7F6]"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
