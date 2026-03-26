'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CustomerLoginForm() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

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

      router.push(returnTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome</h1>
        <p className="subtitle">Enter your details to continue</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 15))}
              placeholder="10-digit mobile number"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
            disabled={loading || phone.length < 10 || name.trim().length < 2}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service.
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)' }}>
          <Link href="/" className="btn btn-outline btn-sm">Return Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLogin() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginForm />
    </Suspense>
  );
}