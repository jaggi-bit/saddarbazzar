'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Package, Tag, Home, TrendingUp, Users, Shield, Activity, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import styles from '../../app/admin/admin.module.css';

const allNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CONTENT_EDITOR'] },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] },
  { label: 'Products', href: '/admin/products', icon: Package, roles: ['ADMIN', 'SUPER_ADMIN', 'CONTENT_EDITOR'] },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Tag, roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CONTENT_EDITOR'] },
  { label: 'Homepage', href: '/admin/homepage', icon: Home, roles: ['ADMIN', 'SUPER_ADMIN', 'CONTENT_EDITOR'] },
  { label: 'Customers', href: '/admin/customers', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp, roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] },
  { label: 'divider', href: '', icon: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Audit Logs', href: '/admin/settings/audit-logs', icon: Shield, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Gateway Health', href: '/admin/system/health', icon: Activity, roles: ['ADMIN', 'SUPER_ADMIN'] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userRole = user?.role || 'ADMIN'; // fallback

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.brandTitle}>Sadar Bazar</div>
        <div className={styles.brandSub}>Admin Panel</div>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item, idx) => {
          if (item.label === 'divider') {
            return <div key={idx} className={styles.navDivider} />;
          }

          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 8, padding: '0 16px' }}>
          Signed in as <strong>{user?.email}</strong><br/>
          Role: <span style={{ color: '#a78bfa' }}>{userRole}</span>
        </div>
        <Link href="/" className={styles.backToStore}>
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
