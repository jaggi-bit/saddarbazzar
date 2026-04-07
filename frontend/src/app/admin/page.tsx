'use client';

import { useDashboardStats } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingBag, Package, Users, Loader2 } from 'lucide-react';
import styles from './admin.module.css';

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

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={24} />
        &nbsp; Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Revenue</span>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statValue}>
            Rs. {(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <div className={styles.statChange}>From paid orders</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Orders</span>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats?.totalOrders || 0}</div>
          <div className={styles.statChange}>
            {stats?.pendingOrders || 0} pending · {stats?.processingOrders || 0} processing
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Products</span>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Package size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats?.totalProducts || 0}</div>
          <div className={styles.statChange}>Active in catalog</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Customers</span>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats?.totalCustomers || 0}</div>
          <div className={styles.statChange}>Registered users</div>
        </div>
      </div>

      {/* Fulfillment Summary */}
      <div className={styles.statsGrid} style={{ marginBottom: 32 }}>
        {[
          { label: 'Pending', value: stats?.pendingOrders, cls: styles.badgePending },
          { label: 'Processing', value: stats?.processingOrders, cls: styles.badgeProcessing },
          { label: 'Shipped', value: stats?.shippedOrders, cls: styles.badgeShipped },
          { label: 'Delivered', value: stats?.deliveredOrders, cls: styles.badgeDelivered },
          { label: 'Canceled', value: stats?.canceledOrders, cls: styles.badgeCanceled },
        ].map((item) => (
          <div className={styles.statCard} key={item.label}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{item.label}</span>
              <span className={`${styles.badge} ${item.cls}`}>{item.label}</span>
            </div>
            <div className={styles.statValue}>{item.value || 0}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Recent Orders</span>
          <button
            className={styles.pageBtn}
            onClick={() => router.push('/admin/orders')}
          >
            View All →
          </button>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>City</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order: any) => (
                <tr
                  key={order.id}
                  className={styles.clickableRow}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {order.id?.substring(0, 8)}...
                  </td>
                  <td>{order.customerName}</td>
                  <td>{order.shippingCity}</td>
                  <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.badge} ${paymentBadge(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${fulfillmentBadge(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No orders yet. They will appear here once customers start placing them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
