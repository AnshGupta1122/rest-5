'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPopup() {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Please enter your name'); return; }
    if (phone.length < 10) { setError('Please enter a valid phone number'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/customer/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_phone', data.phone);
      localStorage.setItem('customer_name', data.name);

      setShow(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: '16px',
        padding: '32px', width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍛</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Welcome!</h2>
          <p style={{ color: 'var(--text-secondary, #666)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to order delicious food
          </p>
        </div>

        {error && <div className="login-error" style={{ marginBottom: '12px', padding: '8px 12px', background: '#fee', color: '#c00', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Name</label>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name" required autoFocus
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #ddd)', fontSize: '0.95rem' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
            <input
              type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 15))}
              placeholder="10-digit mobile number" required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #ddd)', fontSize: '0.95rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '10px' }}
            disabled={loading || phone.length < 10 || name.trim().length < 2}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <button onClick={() => setShow(false)}
          style={{
            display: 'block', width: '100%', textAlign: 'center',
            marginTop: '12px', padding: '8px', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: '0.85rem',
            color: 'var(--text-secondary, #666)'
          }}
        >
          Skip for now
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
