'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBag className={styles.headerIcon} />
            <h2>Your Cart</h2>
            <span className={styles.itemCount}>
              {cart?.items?.length || 0}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {hasItems ? (
            <div className={styles.cartItems}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImageWrapper}>
                    {item.product.imageUrl ? (
                      <Image 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        fill
                        className={styles.itemImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <ShoppingBag size={24} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitleRow}>
                      <h3 className={styles.itemName}>{item.product.name}</h3>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className={styles.itemCategory}>{item.product.categoryName}</p>
                    
                    <div className={styles.itemBottomRow}>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.qtyBtn} 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className={styles.itemPrice}>
                        Rs. {item.itemTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <ShoppingBag size={48} className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>Your cart is empty</h3>
              <p className={styles.emptyText}>Looks like you haven't added anything to your cart yet.</p>
              <button 
                className={styles.continueShoppingBtn}
                onClick={() => setIsOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {hasItems && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalValue}>Rs. {cart.subtotal.toLocaleString()}</span>
            </div>
            <p className={styles.taxesText}>Taxes and shipping calculated at checkout</p>
            <Link 
              href="/checkout" 
              className={styles.checkoutBtn}
              onClick={() => setIsOpen(false)}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
