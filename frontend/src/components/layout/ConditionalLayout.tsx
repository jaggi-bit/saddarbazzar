'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';

/**
 * Conditionally renders the public layout (Navbar, Footer, CartDrawer)
 * only for non-admin routes. Admin pages use their own layout.
 */
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
