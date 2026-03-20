'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q') || undefined;

  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('createdAt,desc'); // field,direction

  const [sortBy, sortDir] = sort.split(',');

  // Data fetching
  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({
    categoryId,
    search,
    page,
    size: 12,
    sortBy,
    sortDir: sortDir as 'asc' | 'desc'
  });

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {search ? `Search Results for "${search}"` : 'All Products'}
        </h1>
        <p className={styles.description}>
          Discover our wide range of authentic products carefully curated for you.
        </p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <div className={styles.categoryList}>
              <button 
                className={`${styles.categoryBtn} ${!categoryId ? styles.categoryBtnActive : ''}`}
                onClick={() => { setCategoryId(undefined); setPage(0); }}
              >
                All Categories
              </button>
              {categories?.map((cat) => (
                <button 
                  key={cat.id}
                  className={`${styles.categoryBtn} ${categoryId === cat.id ? styles.categoryBtnActive : ''}`}
                  onClick={() => { setCategoryId(cat.id); setPage(0); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: '#e4e4e7', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products found</h3>
              <p>Try adjusting your category or search filters.</p>
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
