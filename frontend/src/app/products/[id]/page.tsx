'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id as string);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
          <div className="animate-spin" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255,255,255,0.1)', 
            borderTopColor: '#A855F7', 
            borderRadius: '50%' 
          }} />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.pageContainer} style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h1>Product Not Found</h1>
        <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>We couldn't find the product you're looking for.</p>
        <Link href="/products" style={{ display: 'inline-block', marginTop: '2rem', color: '#A855F7' }}>
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  const allImages = [
    product.imageUrl || '/placeholder.png',
    ...(product.additionalImages || [])
  ];

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
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= product.stockQuantity) {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    console.log(`Add ${quantity} of ${product.id} to cart`);
    // Connect to actual cart logic in Phase 5
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.crumbLink}>Home</Link>
        <span>/</span>
        <Link href="/products" className={styles.crumbLink}>Products</Link>
        <span>/</span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        <div className={styles.gallery}>
          <div className={styles.mainImageContainer}>
            <Image
              src={allImages[activeImageIndex]}
              alt={product.name}
              fill
              className={styles.mainImage}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority
            />
          </div>
          
          {allImages.length > 1 && (
            <div className={styles.thumbnailList}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnailBtn} ${activeImageIndex === idx ? styles.thumbnailActive : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    className={styles.mainImage}
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.category}>{product.categoryName}</div>
          <h1 className={styles.title}>{product.name}</h1>
          
          {isLowStock && (
            <div className={styles.scarcityContainer}>
              <span className={styles.pulseDot}></span>
              Only {product.stockQuantity} left in stock - Order soon
            </div>
          )}

          <div className={styles.priceContainer}>
            {hasDiscount && (
              <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice!)}</span>
            )}
            <span className={`${styles.price} ${hasDiscount ? styles.priceDiscounted : ''}`}>
              {formatPrice(product.price)}
            </span>
            
            {hasDiscount && (
              <span className={styles.discountBadge}>
                Save {formatPrice(product.compareAtPrice! - product.price)}
              </span>
            )}
            {product.isFeatured && (
              <span className={styles.discountBadge} style={{ background: 'var(--gold)', color: 'white', borderColor: 'transparent' }}>
                Featured
              </span>
            )}
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Availability</span>
              <span className={styles.metaValue} style={{ color: isOutOfStock ? '#DC2626' : 'var(--conversion)' }}>
                {isOutOfStock ? 'Sold Out' : `In Stock`}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>SKU</span>
              <span className={styles.metaValue}>{product.sku}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Weight</span>
              <span className={styles.metaValue}>{product.weightGrams ? `${product.weightGrams}g` : 'N/A'}</span>
            </div>
          </div>

          <div className={styles.description}>
            {product.description}
          </div>

          <div className={styles.actions}>
            <div className={styles.quantityCtrl}>
              <button 
                className={styles.qtyBtn} 
                onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
              >
                -
              </button>
              <input 
                type="text" 
                className={styles.qtyInput} 
                value={quantity} 
                readOnly
                aria-label="Quantity"
              />
              <button 
                className={styles.qtyBtn} 
                onClick={() => setQuantity((q: number) => Math.min(product.stockQuantity, q + 1))}
                disabled={isOutOfStock || quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>

            <button 
              className={`${styles.addToCartBtn} ${isOutOfStock ? styles.outOfStockBtn : ''}`}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Sold Out' : (
                <>
                  <ShoppingBag size={20} strokeWidth={2} />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          <div className={styles.trustSignals}>
            <p className={styles.trustText}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--conversion)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secure, encrypted checkout.
            </p>
            <div className={styles.trustIcons}>
              <div className={styles.trustIcon}><ShieldCheck size={18} /> Safepay</div>
              <div className={styles.trustIcon}><CreditCard size={18} /> Visa / MC</div>
              <div className={styles.trustIcon}><Truck size={18} /> Cash on Delivery</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
