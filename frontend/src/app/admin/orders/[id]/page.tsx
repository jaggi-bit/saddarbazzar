'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminOrderDetail } from '@/hooks/useAdmin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Loader2, Truck, CreditCard, Package, Printer, ExternalLink } from 'lucide-react';
import styles from '../../admin.module.css';

const fulfillmentBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: styles.badgePending,
    PROCESSING: styles.badgeProcessing,
    SHIPPED: styles.badgeShipped,
    DELIVERED: styles.badgeDelivered,
    CANCELED: styles.badgeCanceled,
  };
  return map[status] || styles.badgePending;
};

const paymentBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: styles.badgePending,
    PAID: styles.badgePaid,
    FAILED: styles.badgeFailed,
    REFUNDED: styles.badgeRefunded,
  };
  return map[status] || styles.badgePending;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useAdminOrderDetail(orderId);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Sync state when data loads
  if (order && !fulfillmentStatus) {
    setFulfillmentStatus(order.fulfillmentStatus);
    setPaymentStatus(order.paymentStatus);
    setTrackingNumber(order.trackingNumber || '');
    setCourierName(order.courierName || '');
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fulfillmentMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/orders/${orderId}/fulfillment`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] }),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/orders/${orderId}/payment`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] }),
  });

  // PostEx AWB Generation
  const awbMutation = useMutation({
    mutationFn: () => api.post(`/admin/shipping/generate-awb/${orderId}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', orderId] });
      showToast(`AWB Generated! Tracking: ${res.data.trackingNumber}`, 'success');
      // Reset form state so it re-syncs from fresh data
      setFulfillmentStatus('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'AWB generation failed';
      showToast(msg, 'error');
    },
  });

  const handlePrintLabel = () => {
    const tn = order?.trackingNumber || trackingNumber;
    if (tn) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/shipping/print-label/${tn}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={24} />
        &nbsp; Loading order details...
      </div>
    );
  }

  if (!order) {
    return <div className={styles.loadingContainer}>Order not found.</div>;
  }

  const isShipped = order.fulfillmentStatus === 'SHIPPED' || order.fulfillmentStatus === 'DELIVERED';
  const hasTracking = !!(order.trackingNumber);
  const isPendingShipment = order.fulfillmentStatus === 'PENDING' || order.fulfillmentStatus === 'PROCESSING';

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
          background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/orders')} className={styles.pageBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
          Order #{order.id?.substring(0, 8)}
        </h1>
        <span className={`${styles.badge} ${fulfillmentBadge(order.fulfillmentStatus)}`}>
          {order.fulfillmentStatus}
        </span>
        <span className={`${styles.badge} ${paymentBadge(order.paymentStatus)}`}>
          {order.paymentStatus}
        </span>
      </div>

      <div className={styles.orderDetailGrid}>
        {/* Left Column: Items + Shipping */}
        <div>
          {/* Order Items */}
          <div className={styles.detailCard} style={{ marginBottom: 24 }}>
            <div className={styles.detailCardTitle}>Order Items ({order.items?.length || 0})</div>
            {order.items?.map((item: any) => (
              <div key={item.id} className={styles.orderItemRow}>
                <img
                  src={item.productImageUrl || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?'}
                  alt={item.productName}
                  className={styles.orderItemImage}
                />
                <div className={styles.orderItemInfo}>
                  <div className={styles.orderItemName}>{item.productName}</div>
                  <div className={styles.orderItemSku}>SKU: {item.productSku || '—'}</div>
                </div>
                <div className={styles.orderItemQty}>× {item.quantity}</div>
                <div className={styles.orderItemPrice}>Rs. {item.lineTotal?.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Shipping Info */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardTitle}>Shipping Information</div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Name</span>
              <span className={styles.detailValue}>{order.shippingName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{order.shippingPhone}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{order.shippingAddress}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>City</span>
              <span className={styles.detailValue}>{order.shippingCity}</span>
            </div>
            {order.shippingPinCode && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Postal Code</span>
                <span className={styles.detailValue}>{order.shippingPinCode}</span>
              </div>
            )}
            {order.orderNote && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Order Note</span>
                <span className={styles.detailValue}>{order.orderNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary + Actions */}
        <div>
          {/* Price Summary */}
          <div className={styles.detailCard} style={{ marginBottom: 24 }}>
            <div className={styles.detailCardTitle}>Price Summary</div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Subtotal</span>
              <span className={styles.detailValue}>Rs. {order.subtotalAmount?.toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Shipping</span>
              <span className={styles.detailValue}>Rs. {order.shippingAmount?.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Discount</span>
                <span className={styles.detailValue} style={{ color: '#10b981' }}>
                  -Rs. {order.discountAmount?.toLocaleString()}
                </span>
              </div>
            )}
            <div className={styles.detailRow} style={{ borderTop: '2px solid #e2e8f0', paddingTop: 12, marginTop: 8 }}>
              <span className={styles.detailLabel} style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
              <span className={styles.detailValue} style={{ fontSize: '1.1rem', color: '#6c3ce1' }}>
                Rs. {order.totalAmount?.toLocaleString()}
              </span>
            </div>
            <div className={styles.detailRow} style={{ marginTop: 8 }}>
              <span className={styles.detailLabel}>Payment Method</span>
              <span className={styles.detailValue}>{order.paymentMethod}</span>
            </div>
            {order.paymentTransactionId && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Transaction ID</span>
                <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {order.paymentTransactionId}
                </span>
              </div>
            )}
          </div>

          {/* ===== PostEx Shipping Actions ===== */}
          <div className={styles.detailCard} style={{ marginBottom: 24, borderLeft: '4px solid #8b5cf6' }}>
            <div className={styles.detailCardTitle}>
              <Package size={16} style={{ display: 'inline', marginRight: 8 }} />
              PostEx Shipping
            </div>

            {isPendingShipment && !hasTracking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Generate an Air Waybill (AWB) via PostEx to book this shipment.
                </p>
                <button
                  className={styles.updateBtn}
                  onClick={() => awbMutation.mutate()}
                  disabled={awbMutation.isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  }}
                >
                  {awbMutation.isPending ? (
                    <><Loader2 className="animate-spin" size={16} /> Generating AWB...</>
                  ) : (
                    <><Truck size={16} /> Generate PostEx AWB</>
                  )}
                </button>
              </div>
            )}

            {hasTracking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tracking Number</span>
                  <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontWeight: 700, color: '#8b5cf6' }}>
                    {order.trackingNumber}
                  </span>
                </div>
                {order.courierName && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Courier</span>
                    <span className={styles.detailValue}>{order.courierName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    className={styles.updateBtn}
                    onClick={handlePrintLabel}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a' }}
                  >
                    <Printer size={16} /> Print Shipping Label
                  </button>
                  <a
                    href={`https://postex.pk/tracking?trackingNumber=${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pageBtn}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Track Order
                  </a>
                </div>
              </div>
            )}

            {!isPendingShipment && !hasTracking && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                This order is {order.fulfillmentStatus.toLowerCase()} but has no tracking number.
              </p>
            )}
          </div>

          {/* Fulfillment Actions */}
          <div className={styles.detailCard} style={{ marginBottom: 24 }}>
            <div className={styles.detailCardTitle}>
              <Truck size={16} style={{ display: 'inline', marginRight: 8 }} />
              Update Fulfillment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select
                className={styles.statusSelect}
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELED">Canceled</option>
              </select>
              <input
                className={styles.searchInput}
                style={{ width: '100%' }}
                placeholder="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <input
                className={styles.searchInput}
                style={{ width: '100%' }}
                placeholder="Courier Name (e.g., PostEx)"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
              <button
                className={styles.updateBtn}
                onClick={() => fulfillmentMutation.mutate({
                  fulfillmentStatus,
                  trackingNumber: trackingNumber || null,
                  courierName: courierName || null,
                })}
                disabled={fulfillmentMutation.isPending}
              >
                {fulfillmentMutation.isPending ? 'Updating...' : 'Update Fulfillment'}
              </button>
            </div>
          </div>

          {/* Payment Actions */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardTitle}>
              <CreditCard size={16} style={{ display: 'inline', marginRight: 8 }} />
              Update Payment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select
                className={styles.statusSelect}
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <button
                className={styles.updateBtn}
                onClick={() => paymentMutation.mutate({ paymentStatus })}
                disabled={paymentMutation.isPending}
              >
                {paymentMutation.isPending ? 'Updating...' : 'Update Payment Status'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
}
