'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect unauthenticated users to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requireAdmin && user?.role !== 'ADMIN') {
        // Redirect authenticated non-admins from admin pages to home
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router, requireAdmin, pathname]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="animate-spin" style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#A855F7', 
          borderRadius: '50%' 
        }} />
      </div>
    );
  }

  // If we reach here and pass checks, render children
  if (isAuthenticated && (!requireAdmin || user?.role === 'ADMIN')) {
    return <>{children}</>;
  }

  // Prevent flash of protected content while redirecting
  return null;
}
