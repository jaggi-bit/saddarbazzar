'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={64} className={styles.successIcon} />
        </div>
        
        <h1 className={styles.title}>Thank You For Your Order!</h1>
        <p className={styles.message}>
          Your order has been placed successfully. We will send you an email confirmation shortly.
        </p>

        {orderId && (
          <div className={styles.orderIdBox}>
            <span className={styles.orderLabel}>Order Tracking Number:</span>
            <span className={styles.orderNumber}>{orderId}</span>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/products" className={styles.continueShopping}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link href="/profile/orders" className={styles.trackOrder}>
            Track Order Status
          </Link>
        </div>
      </div>
    </div>
  );
}
