'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, Users } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminCustomersPage() {
  const router = useRouter();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: async () => { const { data } = await api.get('/admin/customers'); return data; },
  });

  if (isLoading) return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading customers...</div>;

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        <Users size={24} style={{ display: 'inline', marginRight: 8 }} />Customer Management
      </h1>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>All Users ({customers?.length || 0})</span>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr>
          </thead>
          <tbody>
            {customers?.length > 0 ? customers.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.fullName || '—'}</td>
                <td>{c.email}</td>
                <td>{c.phoneNumber || '—'}</td>
                <td><span className={`${styles.badge} ${c.role === 'CUSTOMER' ? styles.badgeProcessing : styles.badgePaid}`}>{c.role}</span></td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <button className={styles.pageBtn} style={{ fontSize: '0.75rem' }}
                    onClick={() => router.push(`/admin/customers/${c.id}`)}>
                    View 360°
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
