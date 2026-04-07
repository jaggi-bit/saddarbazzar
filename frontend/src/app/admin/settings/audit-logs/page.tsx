'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Shield } from 'lucide-react';
import styles from '../../admin.module.css';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [emailFilter, setEmailFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page, emailFilter],
    queryFn: async () => {
      const params: any = { page, size: 25 };
      if (emailFilter) params.email = emailFilter;
      const { data } = await api.get('/admin/audit-logs', { params });
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setEmailFilter(searchInput); setPage(0); };

  if (isLoading) return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading audit logs...</div>;

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        <Shield size={24} style={{ display: 'inline', marginRight: 8 }} />Audit Logs
      </h1>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Admin Activity ({data?.totalElements || 0} entries)</span>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input className={styles.searchInput} placeholder="Filter by admin email..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} />
            <button type="submit" className={styles.pageBtn}>Filter</button>
            {emailFilter && <button type="button" className={styles.pageBtn}
              onClick={() => { setEmailFilter(''); setSearchInput(''); setPage(0); }}>Clear</button>}
          </form>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr><th>Date</th><th>Admin</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>URI</th><th>IP</th></tr>
          </thead>
          <tbody>
            {data?.content?.length > 0 ? data.content.map((log: any) => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                </td>
                <td style={{ fontWeight: 600 }}>{log.adminEmail}</td>
                <td>
                  <span className={`${styles.badge} ${
                    log.action === 'DELETE' ? styles.badgeCanceled :
                    log.action === 'POST' ? styles.badgeDelivered : styles.badgeProcessing
                  }`}>{log.action}</span>
                </td>
                <td>{log.entityType}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.entityId ? log.entityId.substring(0, 8) + '...' : '—'}</td>
                <td style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.requestUri}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.ipAddress}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No audit logs yet. They are recorded when admins perform create/update/delete operations.</td></tr>
            )}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>Page {data.number + 1} of {data.totalPages}</span>
            <div className={styles.paginationButtons}>
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <button className={styles.pageBtn} disabled={data.last} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
