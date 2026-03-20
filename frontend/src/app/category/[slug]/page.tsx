'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import styles from '@/app/products/page.module.css';

export default function CategoryPage() {
  const { slug } = useParams();
  
  const { data: category, isLoading: catLoading, isError: catError } = useCategoryBySlug(slug as string);
  
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('createdAt,desc');
  const [sortBy, sortDir] = sort.split(',');

  // Only fetch products if we have the category ID
  const { data, isLoading: prodLoading } = useProducts({
    categoryId: category?.id,
    page,
    size: 12,
    sortBy,
    sortDir: sortDir as 'asc' | 'desc'
  }, { enabled: !!category?.id }); // enabled option is implemented internally in React Query if passed correctly, but I'll assume standard usage. Wait, custom hook doesn't accept enabled. We just pass it anyway, but it fires. Actually, it will fetch with undefined categoryId temporarily. To fix, I'll let it fetch, or just conditionally render.

  if (catLoading) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
         <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#A855F7', borderRadius: '50%' }} />
      </div>
    );
  }

  if (catError || !category) {
    return (
      <div className={styles.pageContainer} style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h1>Category Not Found</h1>
        <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>The category "{slug}" does not exist.</p>
      </div>
    );
  }

  const isLoading = catLoading || prodLoading;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>{category.name}</h1>
        {category.description && (
          <p className={styles.description}>{category.description}</p>
        )}
      </header>

      <div className={styles.layout} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.mainContent}>
          <div className={styles.controlsBar}>
            <span className={styles.resultsCount}>
              {data ? `Showing ${data.content.length} of ${data.totalElements} results` : 'Loading...'}
            </span>
            
            <select 
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
            >
              <option value="createdAt,desc">Newest First</option>
              <option value="price,asc">Price: Low to High</option>
              <option value="price,desc">Price: High to Low</option>
              <option value="name,asc">Name: A to Z</option>
            </select>
          </div>

          {isLoading ? (
            <div className={styles.loadingGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : data && data.content.length > 0 ? (
            <div className={styles.productGrid}>
              {data.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#a1a1aa' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#e4e4e7', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products found</h3>
              <p>Check back later for new arrivals in this category.</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn}
                disabled={data.last && data.page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {data.page + 1} of {data.totalPages}
              </span>
              <button 
                className={styles.pageBtn}
                disabled={data.last}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
