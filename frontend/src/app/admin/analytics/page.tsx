'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, TrendingUp, Package, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => { const { data } = await api.get('/admin/analytics'); return data; },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading analytics...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        <TrendingUp size={24} style={{ display: 'inline', marginRight: 8 }} />Analytics & Insights
      </h1>

      {/* Top stats */}
      <div className={styles.statsGrid} style={{ marginBottom: 32 }}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Revenue</span>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><TrendingUp size={20} /></div>
          </div>
          <div className={styles.statValue}>Rs. {(analytics?.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Orders</span>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><Package size={20} /></div>
          </div>
          <div className={styles.statValue}>{analytics?.totalOrders || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Top Products by Quantity */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>🏆 Top Products by Sales</span>
          </div>
          <table className={styles.dataTable}>
            <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th></tr></thead>
            <tbody>
              {analytics?.topProducts?.length > 0 ? analytics.topProducts.map((p: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#8b5cf6' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.productName}</td>
                  <td style={{ fontWeight: 700 }}>{p.totalQuantitySold}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No sales data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Products by Revenue */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>💰 Top Products by Revenue</span>
          </div>
          <table className={styles.dataTable}>
            <thead><tr><th>#</th><th>Product</th><th>Revenue</th></tr></thead>
            <tbody>
              {analytics?.topRevenueProducts?.length > 0 ? analytics.topRevenueProducts.map((p: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.productName}</td>
                  <td style={{ fontWeight: 700 }}>Rs. {p.totalRevenue?.toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No revenue data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Cities */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}><MapPin size={16} style={{ display: 'inline', marginRight: 8 }} />Top Cities</span>
          </div>
          <table className={styles.dataTable}>
            <thead><tr><th>#</th><th>City</th><th>Orders</th></tr></thead>
            <tbody>
              {analytics?.topCities?.length > 0 ? analytics.topCities.map((c: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#3b82f6' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.city}</td>
                  <td style={{ fontWeight: 700 }}>{c.orderCount}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No city data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Methods */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}><CreditCard size={16} style={{ display: 'inline', marginRight: 8 }} />Payment Methods</span>
          </div>
          <table className={styles.dataTable}>
            <thead><tr><th>Method</th><th>Orders</th></tr></thead>
            <tbody>
              {analytics?.paymentMethods && Object.entries(analytics.paymentMethods).length > 0 ? (
                Object.entries(analytics.paymentMethods).map(([method, count]: any) => (
                  <tr key={method}>
                    <td style={{ fontWeight: 600 }}>{method}</td>
                    <td style={{ fontWeight: 700 }}>{count}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No payment data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfillment Breakdown */}
      <div className={styles.tableCard} style={{ marginBottom: 32 }}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>📦 Orders by Fulfillment Status</span>
        </div>
        <div style={{ padding: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {analytics?.ordersByFulfillment && Object.entries(analytics.ordersByFulfillment).map(([status, count]: any) => (
            <div key={status} className={styles.statCard} style={{ minWidth: 140, flex: '1 1 140px' }}>
              <span className={`${styles.badge} ${styles[`badge${status.charAt(0) + status.slice(1).toLowerCase()}`] || styles.badgePending}`}>{status}</span>
              <div className={styles.statValue} style={{ marginTop: 8 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: 8, color: '#f59e0b' }} />Low Stock Alert (≤ 10 units)
          </span>
        </div>
        <table className={styles.dataTable}>
          <thead><tr><th>SKU</th><th>Product</th><th>Stock</th></tr></thead>
          <tbody>
            {analytics?.lowStockProducts?.length > 0 ? analytics.lowStockProducts.map((p: any, i: number) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>
                  <span style={{
                    color: p.stock === 0 ? '#991b1b' : '#92400e',
                    fontWeight: 700,
                    background: p.stock === 0 ? '#fee2e2' : '#fef3c7',
                    padding: '2px 8px', borderRadius: 12, fontSize: '0.8rem'
                  }}>
                    {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>All products are well-stocked 👍</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
