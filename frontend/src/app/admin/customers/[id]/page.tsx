'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Loader2, DollarSign, ShoppingBag, CreditCard, TrendingUp } from 'lucide-react';
import styles from '../../admin.module.css';

const fulfillmentBadge = (status: string) => {
  const map: Record<string, string> = { PENDING: styles.badgePending, PROCESSING: styles.badgeProcessing, SHIPPED: styles.badgeShipped, DELIVERED: styles.badgeDelivered, CANCELED: styles.badgeCanceled };
  return map[status] || styles.badgePending;
};
const paymentBadge = (status: string) => {
  const map: Record<string, string> = { PENDING: styles.badgePending, PAID: styles.badgePaid, FAILED: styles.badgeFailed, REFUNDED: styles.badgeRefunded };
  return map[status] || styles.badgePending;
};

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin', 'customers', userId, '360'],
    queryFn: async () => { const { data } = await api.get(`/admin/customers/${userId}/360`); return data; },
    enabled: !!userId,
  });

  if (isLoading) return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading customer data...</div>;
  if (!customer) return <div className={styles.loadingContainer}>Customer not found.</div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/customers')} className={styles.pageBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{customer.fullName || 'Unknown'}</h1>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.email} · {customer.phoneNumber || 'No phone'} · Member since {customer.memberSince ? new Date(customer.memberSince).toLocaleDateString() : '—'}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Lifetime Value</span>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><DollarSign size={20} /></div>
          </div>
          <div className={styles.statValue}>Rs. {(customer.ltv || 0).toLocaleString()}</div>
          <div className={styles.statChange}>Total spent (PAID / DELIVERED)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Avg Order Value</span>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><TrendingUp size={20} /></div>
          </div>
          <div className={styles.statValue}>Rs. {(customer.aov || 0).toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Orders</span>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}><ShoppingBag size={20} /></div>
          </div>
          <div className={styles.statValue}>{customer.totalOrders || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Preferred Payment</span>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><CreditCard size={20} /></div>
          </div>
          <div className={styles.statValue} style={{ fontSize: '1.2rem' }}>{customer.preferredPayment || 'N/A'}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.tableCard} style={{ marginTop: 32 }}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Recent Orders (Last 5)</span>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr><th>Date</th><th>Order ID</th><th>Amount</th><th>Payment</th><th>Fulfillment</th><th>Method</th></tr>
          </thead>
          <tbody>
            {customer.recentOrders?.length > 0 ? customer.recentOrders.map((o: any) => (
              <tr key={o.id} className={styles.clickableRow} onClick={() => router.push(`/admin/orders/${o.id}`)}>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.id?.substring(0, 8)}...</td>
                <td style={{ fontWeight: 700 }}>Rs. {o.totalAmount?.toLocaleString()}</td>
                <td><span className={`${styles.badge} ${paymentBadge(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                <td><span className={`${styles.badge} ${fulfillmentBadge(o.fulfillmentStatus)}`}>{o.fulfillmentStatus}</span></td>
                <td>{o.paymentMethod || '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
