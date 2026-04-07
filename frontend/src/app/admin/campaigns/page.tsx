'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, X, Save, Tag } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '', discountType: 'PERCENT', value: '', minOrderAmount: '',
    maxDiscountAmount: '', usageLimit: '', validFrom: '', validUntil: '', isActive: true,
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => { const { data } = await api.get('/admin/campaigns'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/campaigns', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/admin/campaigns/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/campaigns/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setForm({ code: '', discountType: 'PERCENT', value: '', minOrderAmount: '',
      maxDiscountAmount: '', usageLimit: '', validFrom: '', validUntil: '', isActive: true });
  };

  const startEdit = (camp: any) => {
    setEditingId(camp.id);
    setForm({
      code: camp.code || '', discountType: camp.discountType || 'PERCENT',
      value: camp.value?.toString() || '', minOrderAmount: camp.minOrderAmount?.toString() || '',
      maxDiscountAmount: camp.maxDiscountAmount?.toString() || '',
      usageLimit: camp.usageLimit?.toString() || '',
      validFrom: camp.validFrom ? new Date(camp.validFrom).toISOString().slice(0, 16) : '',
      validUntil: camp.validUntil ? new Date(camp.validUntil).toISOString().slice(0, 16) : '',
      isActive: camp.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      value: parseFloat(form.value),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      isActive: form.isActive,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Loading campaigns...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          <Tag size={24} style={{ display: 'inline', marginRight: 8 }} />Campaign Management
        </h1>
        <button className={styles.updateBtn} onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {showForm && (
        <div className={styles.detailCard} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className={styles.detailCardTitle} style={{ margin: 0, padding: 0, border: 'none' }}>
              {editingId ? 'Edit Campaign' : 'Create New Campaign'}
            </div>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Promo Code *</label>
              <input className={styles.searchInput} style={{ width: '100%', textTransform: 'uppercase' }} value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SUMMER30" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Discount Type *</label>
              <select className={styles.filterSelect} style={{ width: '100%' }} value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                Discount Value * {form.discountType === 'PERCENT' ? '(%)' : '(Rs.)'}
              </label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" step="0.01" value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Min Order Amount</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" step="0.01" value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="No minimum" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Max Discount Cap</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" step="0.01" value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Usage Limit</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="number" value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Valid From</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="datetime-local" value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Valid Until *</label>
              <input className={styles.searchInput} style={{ width: '100%' }} type="datetime-local" value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className={styles.updateBtn} disabled={createMutation.isPending || updateMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {editingId ? 'Update' : 'Create'} Campaign
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Active Campaigns ({campaigns?.length || 0})</span>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Code</th><th>Type</th><th>Value</th><th>Min. Order</th><th>Max Cap</th>
              <th>Usage</th><th>Valid Until</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.length > 0 ? campaigns.map((camp: any) => {
              const expired = camp.validUntil && new Date(camp.validUntil) < new Date();
              return (
                <tr key={camp.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{camp.code}</td>
                  <td>{camp.discountType === 'PERCENT' ? 'Percentage' : 'Fixed'}</td>
                  <td style={{ fontWeight: 600 }}>
                    {camp.discountType === 'PERCENT' ? `${camp.value}%` : `Rs. ${camp.value?.toLocaleString()}`}
                  </td>
                  <td>{camp.minOrderAmount ? `Rs. ${camp.minOrderAmount?.toLocaleString()}` : '—'}</td>
                  <td>{camp.maxDiscountAmount ? `Rs. ${camp.maxDiscountAmount?.toLocaleString()}` : '—'}</td>
                  <td>{camp.timesUsed || 0}{camp.usageLimit ? ` / ${camp.usageLimit}` : ''}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {camp.validUntil ? new Date(camp.validUntil).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${expired ? styles.badgeCanceled : camp.isActive ? styles.badgeDelivered : styles.badgePending}`}>
                      {expired ? 'Expired' : camp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(camp)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 4 }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => { if (confirm('Delete this campaign?')) deleteMutation.mutate(camp.id); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No campaigns yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
