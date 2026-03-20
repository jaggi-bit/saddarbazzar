import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= 5;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}>
      <Link href={`/products/${product.id}`} className={styles.imageContainer}>
        <div className={styles.badges}>
          {isOutOfStock && <span className={styles.badge}>Sold Out</span>}
          {hasDiscount && (
            <span className={`${styles.badge} ${styles.badgeDiscount}`}>
              -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
            </span>
          )}
        </div>
        
        <Image
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
        />
      </Link>

      <div className={styles.content}>
        <span className={styles.category}>{product.categoryName}</span>
        
        <Link href={`/products/${product.id}`} className={styles.title}>
          {product.name}
        </Link>

        {isLowStock && (
          <div className={styles.scarcityContainer}>
            <span className={styles.pulseDot}></span>
            Only {product.stockQuantity} left in stock - Order soon
          </div>
        )}
        
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            {hasDiscount && (
              <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice!)}</span>
            )}
            <span className={`${styles.price} ${hasDiscount ? styles.priceDiscounted : ''}`}>
              {formatPrice(product.price)}
            </span>
          </div>
          
          {isOutOfStock ? (
             <div className={styles.outOfStockBtn}>Sold Out</div>
          ) : (
            <button 
              className={styles.addBtn}
              onClick={(e) => {
                e.preventDefault();
                console.log('Add to cart', product.id);
              }}
              aria-label="Add to cart"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
