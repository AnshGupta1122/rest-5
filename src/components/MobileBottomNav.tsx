'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

import { useEffect, useState } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('customer_token'));
  }, [pathname]);

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  const tabs = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/menu', icon: '📋', label: 'Menu' },
    { href: isLogged ? '/my-orders' : '/login', icon: '👤', label: 'Profile' },
    { href: '/cart', icon: '🛒', label: 'Cart', badge: totalItems },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map(tab => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-bottom-nav-icon">
              {tab.icon}
              {tab.badge ? <span className="mobile-bottom-nav-badge pulse-animation">{tab.badge}</span> : null}
            </span>
            <span className="mobile-bottom-nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
