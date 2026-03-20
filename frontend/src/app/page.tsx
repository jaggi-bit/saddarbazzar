'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <main className={styles.main}>
      <div className={styles.backgroundEffects}>
        <div className={styles.glowBlob} />
        <div className={styles.glowBlob2} />
      </div>

      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <h1 className={`${styles.title} animate-fade-in-up`}>
            Premium <span className={styles.titleAccent}>Essentials</span>
          </h1>

          <p className={`${styles.subtitle} animate-fade-in-up delay-100`}>
            Curated collections of authentic products shipped fast across Pakistan.
          </p>

          <p className={`${styles.tagline} animate-fade-in-up delay-200`}>
            Fast delivery across Pakistan • Easypaisa • JazzCash • Cards • COD
          </p>

          <div className="animate-fade-in-up delay-300" style={{ marginTop: '2rem' }}>
            <Link href="/products" style={{ 
              background: 'linear-gradient(135deg, #A855F7, #EC4899)', 
              color: 'white', 
              padding: '1rem 2.5rem', 
              borderRadius: '9999px',
              fontSize: '1.1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'transform 0.2s',
              boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)'
            }}>
              Shop Now
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <Link href="/products" className={styles.viewAll}>View All &rarr;</Link>
          </div>

          {categoriesLoading ? (
            <div className={styles.loadingGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} style={{ aspectRatio: '1' }} />)}
            </div>
          ) : (
            <div className={styles.categoryGrid}>
              {categories?.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className={styles.categoryCard}>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <Link href="/products" className={styles.viewAll}>View All &rarr;</Link>
          </div>

          {featuredLoading ? (
            <div className={styles.loadingGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonCard} style={{ aspectRatio: '3/4' }} />)}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
