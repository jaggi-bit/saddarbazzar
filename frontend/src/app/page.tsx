'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import styles from './page.module.css';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function Home() {
  const { data, isLoading, isError, error } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    },
    retry: 2,
    refetchInterval: 30000,
  });

  return (
    <main className={styles.main}>
      {/* Background Effects */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.logoContainer} animate-float`}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🏪</span>
            </div>
          </div>

          <h1 className={`${styles.title} animate-fade-in-up`}>
            Sadar <span className={styles.titleAccent}>Bazar</span>
          </h1>

          <p className={`${styles.subtitle} animate-fade-in-up delay-100`}>
            Your one-stop shop for the best products at unbeatable prices
          </p>

          <p className={`${styles.tagline} animate-fade-in-up delay-200`}>
            Fast delivery across Pakistan • Easypaisa • JazzCash • Cards • COD
          </p>

          {/* System Status Card */}
          <div className={`${styles.statusCard} animate-fade-in-up delay-300`}>
            <div className={styles.statusHeader}>
              <span className={styles.statusTitle}>⚡ System Status</span>
              {isLoading && (
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' }}>
                  Checking...
                </span>
              )}
              {data && (
                <span className="badge badge-success">
                  <span className={styles.statusDot} />
                  {data.status}
                </span>
              )}
              {isError && (
                <span className="badge badge-error">
                  Offline
                </span>
              )}
            </div>

            <div className={styles.statusDetails}>
              {isLoading && (
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Connecting to backend...</span>
                  <div className={styles.shimmer} />
                </div>
              )}

              {data && (
                <>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Service</span>
                    <span className={styles.statusValue}>{data.service}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>API</span>
                    <span className={styles.statusValue} style={{ color: 'var(--color-success)' }}>Connected</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Last Check</span>
                    <span className={styles.statusValue}>
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}

              {isError && (
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Error</span>
                  <span className={styles.statusValue} style={{ color: 'var(--color-error)' }}>
                    Backend not reachable — start the Spring Boot server
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Phase Progress */}
          <div className={`${styles.phaseCard} animate-fade-in-up delay-400`}>
            <h3 className={styles.phaseTitle}>🚀 Development Progress</h3>
            <div className={styles.phaseGrid}>
              <div className={`${styles.phase} ${styles.phaseActive}`}>
                <span className={styles.phaseNumber}>1</span>
                <span className={styles.phaseName}>Scaffolding</span>
              </div>
              <div className={styles.phase}>
                <span className={styles.phaseNumber}>2</span>
                <span className={styles.phaseName}>Database</span>
              </div>
              <div className={styles.phase}>
                <span className={styles.phaseNumber}>3</span>
                <span className={styles.phaseName}>Auth</span>
              </div>
              <div className={styles.phase}>
                <span className={styles.phaseNumber}>4</span>
                <span className={styles.phaseName}>Catalog</span>
              </div>
              <div className={styles.phase}>
                <span className={styles.phaseNumber}>5</span>
                <span className={styles.phaseName}>Cart</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
