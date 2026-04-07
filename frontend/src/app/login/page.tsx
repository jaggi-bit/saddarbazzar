'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const reason = searchParams.get('reason');
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', formData);
      await checkAuth(); // refresh zustand state
      router.push(redirectTo); // redirect to intended page (or home)
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your Sadar Bazar account</p>

        {reason === 'admin' && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', fontWeight: 500 }}>
            🔒 Admin access required. Please log in with your admin credentials.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              className={styles.input}
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <span className={styles.errorText}>{error}</span>}

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account?{' '}
          <Link href="/register" className={styles.link}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
