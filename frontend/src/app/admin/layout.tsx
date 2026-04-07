'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CONTENT_EDITOR'].includes(user?.role || '')) {
        router.replace('/login?redirect=/admin&reason=admin');
      } else {
        setChecked(true);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !checked) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f1f5f9', color: '#64748b', fontSize: '1rem',
        flexDirection: 'column', gap: 16
      }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span>Checking admin access...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.adminContent}>
        <div className={styles.adminMain}>
          {children}
        </div>
      </div>
    </div>
  );
}
