'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    sku: '', name: '', description: '', price: '', compareAtPrice: '',
    stockQuantity: '', categoryId: '', imageUrl: '', isFeatured: false, isActive: true
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { page, size: 15, sortBy: 'createdAt', sortDir: 'desc' } });
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/products', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/admin/products/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm({ sku: '', name: '', description: '', price: '', compareAtPrice: '',
      stockQuantity: '', categoryId: '', imageUrl: '', isFeatured: false, isActive: true });
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      sku: product.sku || '', name: product.name || '', description: product.description || '',
      price: product.price?.toString() || '', compareAtPrice: product.compareAtPrice?.toString() || '',
      stockQuantity: product.stockQuantity?.toString() || '', categoryId: product.category?.id || '',
      imageUrl: product.imageUrl || '', isFeatured: product.isFeatured || false, isActive: product.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sku: form.sku, name: form.name, description: form.description,
      price: parseFloat(form.price), compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      stockQuantity: parseInt(form.stockQuantity), categoryId: form.categoryId || null,
      imageUrl: form.imageUrl || null, isFeatured: form.isFeatured, isActive: form.isActive,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading products...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Product Management</h1>
        <button className={styles.updateBtn} onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className={styles.detailCard} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className={styles.detailCardTitle} style={{ margin: 0, padding: 0, border: 'none' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </div>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>SKU *</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!editingProduct} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Name *</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Description</label>
              <textarea className={styles.searchInput} style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Price (PKR) *</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Compare-At Price</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" step="0.01" value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Stock Quantity *</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Category</label>
              <select className={styles.filterSelect} style={{ width: '100%' }} value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">— No Category —</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Image URL</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className={styles.updateBtn}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {editingProduct ? 'Update' : 'Create'} Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>All Products {data?.totalElements ? `(${data.totalElements})` : ''}</span>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content?.length > 0 ? data.content.map((product: any) => (
              <tr key={product.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{product.sku || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={product.imageUrl || 'https://placehold.co/36x36/e2e8f0/94a3b8?text=?'}
                      alt={product.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ fontWeight: 600 }}>{product.name}</span>
                  </div>
                </td>
                <td>{product.categoryName || '—'}</td>
                <td style={{ fontWeight: 700 }}>Rs. {product.price?.toLocaleString()}</td>
                <td><span style={{ color: product.stockQuantity > 10 ? '#065f46' : product.stockQuantity > 0 ? '#92400e' : '#991b1b', fontWeight: 600 }}>
                  {product.stockQuantity}
                </span></td>
                <td>{product.isFeatured ? '⭐' : '—'}</td>
                <td><span className={`${styles.badge} ${product.isActive !== false ? styles.badgeDelivered : styles.badgeCanceled}`}>
                  {product.isActive !== false ? 'Active' : 'Inactive'}
                </span></td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    api.get(`/products/${product.id}`).then(res => startEdit(res.data));
                  }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 4 }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => {
                    if (confirm('Delete this product?')) deleteMutation.mutate(product.id);
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>Page {data.page + 1} of {data.totalPages}</span>
            <div className={styles.paginationButtons}>
              <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <button className={styles.pageBtn} disabled={data.last} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
