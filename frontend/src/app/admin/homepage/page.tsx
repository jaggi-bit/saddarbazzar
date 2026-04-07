'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Save, Home } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminHomepagePage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'homepage'],
    queryFn: async () => { const { data } = await api.get('/admin/homepage'); return data; },
  });

  const [form, setForm] = useState<any>(null);

  // Sync on load
  if (settings && !form) {
    setForm({ ...settings });
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/admin/homepage', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'homepage'] });
      setSuccessMsg('Homepage settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading || !form) {
    return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading settings...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
        <Home size={24} style={{ display: 'inline', marginRight: 8 }} />Homepage Management
      </h1>

      {successMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.9rem' }}>
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hero Banner */}
        <div className={styles.detailCard} style={{ marginBottom: 24 }}>
          <div className={styles.detailCardTitle}>Hero Banner</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Banner Title</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.heroBannerTitle || ''}
                onChange={(e) => setForm({ ...form, heroBannerTitle: e.target.value })}
                placeholder="Welcome to Sadar Bazar" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Banner Subtitle</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.heroBannerSubtitle || ''}
                onChange={(e) => setForm({ ...form, heroBannerSubtitle: e.target.value })}
                placeholder="Your favourite shopping destination" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Banner Image URL</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.heroBannerImageUrl || ''}
                onChange={(e) => setForm({ ...form, heroBannerImageUrl: e.target.value })}
                placeholder="https://..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Banner Link</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.heroBannerLink || ''}
                onChange={(e) => setForm({ ...form, heroBannerLink: e.target.value })}
                placeholder="/products or /category/electronics" />
            </div>
          </div>
        </div>

        {/* Promo Bar */}
        <div className={styles.detailCard} style={{ marginBottom: 24 }}>
          <div className={styles.detailCardTitle}>Promotional Banner Bar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Promo Bar Text</label>
              <input className={styles.searchInput} style={{ width: '100%' }} value={form.promoBarText || ''}
                onChange={(e) => setForm({ ...form, promoBarText: e.target.value })}
                placeholder="Free Shipping on Orders Over Rs. 3,000!" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', paddingBottom: 4 }}>
              <input type="checkbox" checked={form.showPromoBar ?? true}
                onChange={(e) => setForm({ ...form, showPromoBar: e.target.checked })} />
              Show Promo Bar
            </label>
          </div>
        </div>

        {/* Section Toggles */}
        <div className={styles.detailCard} style={{ marginBottom: 24 }}>
          <div className={styles.detailCardTitle}>Homepage Sections</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 16 }}>
            Toggle which sections appear on the customer-facing homepage.
          </p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
              <input type="checkbox" checked={form.showFeaturedProducts ?? true}
                onChange={(e) => setForm({ ...form, showFeaturedProducts: e.target.checked })} />
              ⭐ Featured Products
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
              <input type="checkbox" checked={form.showCategories ?? true}
                onChange={(e) => setForm({ ...form, showCategories: e.target.checked })} />
              📂 Categories
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
              <input type="checkbox" checked={form.showNewArrivals ?? true}
                onChange={(e) => setForm({ ...form, showNewArrivals: e.target.checked })} />
              🆕 New Arrivals
            </label>
          </div>
        </div>

        <button type="submit" className={styles.updateBtn} disabled={updateMutation.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', fontSize: '1rem' }}>
          <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Homepage Settings'}
        </button>
      </form>
    </>
  );
}
