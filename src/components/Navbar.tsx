'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function Navbar({ siteName = 'Spice Garden', siteIcon = '🌶️' }: { siteName?: string, siteIcon?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_phone');
    localStorage.removeItem('customer_name');
    setCustomerToken(null);
    setCustomerName(null);
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Simple check for auth state (re-runs on pathname change)
    setCustomerToken(localStorage.getItem('customer_token'));
    setCustomerName(localStorage.getItem('customer_name'));
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) {
    return null; // Admin has its own layout
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>{siteIcon}</span> {siteName}
        </Link>

        {customerToken && (
          <div style={{ flex: 1, textAlign: 'center', pointerEvents: 'none' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 500, letterSpacing: '0.02em' }}>Welcome, <strong style={{ color: 'var(--primary)', pointerEvents: 'auto', fontWeight: 700 }}>{customerName || 'Guest'}</strong></span>
          </div>
        )}

        {/* Desktop Menu */}
        <div className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/my-orders">📦 My Orders</Link>
          {!customerToken && (
            <Link href="/login">👤 Login</Link>
          )}
          <Link href="/cart" className="cart-btn">
            🛒 Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          {customerToken && (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0, marginLeft: 'var(--space-2xl)' }}>🚪 Logout</button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></span>
          <span style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
        </button>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="navbar-links open" style={{ display: 'flex' }}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link>
            <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)}>📦 My Orders</Link>
            {customerToken ? (
              <span style={{ color: 'var(--text-secondary)', padding: 'var(--space-md) 0', fontSize: '1.2rem', fontWeight: 500 }}>Welcome, <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{customerName || 'Guest'}</strong></span>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>👤 Login</Link>
            )}
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 Cart 
              {totalItems > 0 && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{totalItems}</span>}
            </Link>
            {customerToken && (
              <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 'var(--space-md) 0', textAlign: 'left', marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border)' }}>🚪 Logout</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
