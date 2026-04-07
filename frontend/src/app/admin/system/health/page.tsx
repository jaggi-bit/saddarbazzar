'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Activity, RefreshCw } from 'lucide-react';
import styles from '../../admin.module.css';

export default function GatewayHealthPage() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: health, isLoading } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: async () => { const { data } = await api.get('/admin/health/gateways'); return data; },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'health'] });
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) return <div className={styles.loadingContainer}><Loader2 className="animate-spin" size={24} /> Running health checks...</div>;

  const renderStatusCard = (key: string, gw: any) => {
    const isUp = gw.status === 'UP';
    const isNotConfigured = gw.status === 'NOT_CONFIGURED';
    const isWarning = gw.latencyMs > 2000;

    return (
      <div className={styles.detailCard} key={key} style={{
        borderLeft: `4px solid ${isNotConfigured ? '#f59e0b' : isUp && !isWarning ? '#10b981' : '#ef4444'}`,
        marginBottom: 24, position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Status dot */}
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: isNotConfigured ? '#f59e0b' : isUp && !isWarning ? '#10b981' : '#ef4444',
            boxShadow: `0 0 12px ${isNotConfigured ? '#f59e0b' : isUp && !isWarning ? '#10b981' : '#ef4444'}80`,
            animation: (!isUp || isWarning) && !isNotConfigured ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{gw.label}</div>
            <span className={`${styles.badge} ${
              isNotConfigured ? styles.badgePending :
              isUp && !isWarning ? styles.badgeDelivered : styles.badgeCanceled
            }`}>
              {isNotConfigured ? 'NOT CONFIGURED' : isUp ? (isWarning ? 'SLOW' : 'OPERATIONAL') : 'DOWN'}
            </span>
          </div>
        </div>

        {!isNotConfigured && (
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Latency</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isWarning ? '#ef4444' : '#0f172a' }}>
                {gw.latencyMs}ms
              </div>
            </div>
            {gw.httpCode && (
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>HTTP Code</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{gw.httpCode}</div>
              </div>
            )}
          </div>
        )}

        {gw.message && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef3c7', borderRadius: 8, fontSize: '0.85rem', color: '#92400e' }}>
            {gw.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          <Activity size={24} style={{ display: 'inline', marginRight: 8 }} />Gateway Health
        </h1>
        <button className={styles.updateBtn} onClick={handleRefresh} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Checking...' : 'Refresh Health Check'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {health && Object.entries(health).map(([key, gw]: [string, any]) => renderStatusCard(key, gw))}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </>
  );
}
