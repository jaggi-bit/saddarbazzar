'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminOrders } from '@/hooks/useAdmin';
import { Loader2, Search } from 'lucide-react';
import styles from '../admin.module.css';

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useAdminOrders({
    status: status !== 'ALL' ? status : undefined,
    search: search || undefined,
    page,
    size: 15,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={24} />
        &nbsp; Loading orders...
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        Order Management
      </h1>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            All Orders {data?.totalElements ? `(${data.totalElements})` : ''}
          </span>
          <div className={styles.tableControls}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <input
                  className={styles.searchInput}
                  placeholder="Search by name or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.pageBtn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Search size={14} /> Search
              </button>
            </form>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.content?.length > 0 ? (
              data.content.map((order: any) => (
                <tr
                  key={order.id}
                  className={styles.clickableRow}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {order.id?.substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>{order.shippingCity}</td>
                  <td style={{ textAlign: 'center' }}>{order.itemCount}</td>
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
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {search ? 'No orders match your search.' : 'No orders found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Page {data.page + 1} of {data.totalPages} · {data.totalElements} orders
            </span>
            <div className={styles.paginationButtons}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className={styles.pageBtn}
                disabled={data.last}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
