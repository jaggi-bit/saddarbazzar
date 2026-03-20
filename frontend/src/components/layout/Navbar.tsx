'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce user input by 400ms to save server resources
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch predictive suggestions when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`http://localhost:8080/api/v1/products/search?q=${encodeURIComponent(debouncedQuery)}&size=4`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.content || []);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>

        {/* Logo */}
        <Link href="/" className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <Image src="/logo.png" alt="Sadar Bazar" width={140} height={45} style={{ objectFit: 'contain' }} priority />
          </div>
        </Link>

        {/* Search */}
        <div className={styles.searchArea}>
          <div className={styles.searchContainer} ref={dropdownRef} style={{ position: 'relative' }}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <div className={styles.searchIcon}>
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search for premium products..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 1) setShowDropdown(true);
                }}
              />
            </form>

            {/* Predictive Dropdown */}
            {showDropdown && searchQuery.trim().length > 1 && (
              <div className={styles.searchDropdown}>
                {isSearching ? (
                  <div className={styles.suggestionLoading}>Searching...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.id}`} 
                      className={styles.suggestionItem}
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      {product.imageUrl && (
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name} 
                          width={40} 
                          height={40} 
                          className={styles.suggestionImage}
                        />
                      )}
                      <div className={styles.suggestionInfo}>
                        <span className={styles.suggestionName}>{product.name}</span>
                        <span className={styles.suggestionPrice}>Rs {product.price.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.suggestionEmpty}>No products found for &quot;{debouncedQuery}&quot;</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsArea}>

          <button className={styles.iconBtn} onClick={() => router.push('/cart')} aria-label="Cart">
            <ShoppingBag size={22} strokeWidth={2} />
            {/* Hardcoded 0 for Phase 4, will connect in Phase 5 */}
            <span className={styles.cartBadge}>0</span>
          </button>

          <div className={styles.authButtons}>
            {!isAuthenticated ? (
              <>
                <Link href="/login" className={styles.loginBtn}>
                  Log in
                </Link>
                <Link href="/register" className={styles.signupBtn}>
                  Sign up
                </Link>
              </>
            ) : (
              <div className={styles.userMenu}>
                {user?.role === 'ADMIN' && (
                  <button onClick={() => router.push('/admin/dashboard')} className={styles.iconBtn} title="Admin Panel">
                    <LayoutDashboard size={20} strokeWidth={2} />
                  </button>
                )}

                <span className={styles.userGreeting}>Hi, {user?.fullName}</span>

                <button onClick={() => logout()} className={styles.iconBtn} title="Logout">
                  <LogOut size={20} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
