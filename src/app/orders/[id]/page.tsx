'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderTracker({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll for status updates every 15 seconds
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <h2>Order Not Found</h2>
          <p>We couldn't find the order you're looking for.</p>
          <Link href="/menu" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Return to Menu</Link>
        </div>
      </div>
    );
  }

  const statusSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '📝';
      case 'CONFIRMED': return '✅';
      case 'PREPARING': return '👨‍🍳';
      case 'OUT_FOR_DELIVERY': return '🛵';
      case 'DELIVERED': return '🍱';
      case 'CANCELLED': return '❌';
      default: return '❓';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Waiting for restaurant to confirm...';
      case 'CONFIRMED': return 'Your order has been confirmed!';
      case 'PREPARING': return 'Chef is preparing your delicious meal...';
      case 'OUT_FOR_DELIVERY': return 'Our rider is on the way to you! 🛵';
      case 'DELIVERED': return 'Enjoy your meal! Hope you love it.';
      case 'CANCELLED': return 'This order was cancelled.';
      default: return 'Updating status...';
    }
  };

  return (
    <div className="confirmation-page" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
      <div className="confirmation-card" style={{ maxWidth: '600px', width: '100%', padding: 'var(--space-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
          {getStatusIcon(order.status)}
        </div>
        
        <h2 style={{ marginBottom: 'var(--space-xs)' }}>{order.status.replace(/_/g, ' ')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
          {getStatusMessage(order.status)}
        </p>

        {/* Progress Bar */}
        {order.status !== 'CANCELLED' && (
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>Placed</span>
              <span>Preparing</span>
              <span>Delivery</span>
              <span>Enjoy</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div 
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  height: '100%', 
                  background: 'var(--primary)', 
                  width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100}%`,
                  transition: 'width 0.5s ease-in-out'
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
               {statusSteps.map((s, i) => (
                 <div key={s} style={{ 
                   width: '12px', 
                   height: '12px', 
                   borderRadius: '50%', 
                   background: i <= currentStepIndex ? 'var(--primary)' : 'var(--border)',
                   border: i === currentStepIndex ? '3px solid #fff' : 'none',
                   boxShadow: i === currentStepIndex ? '0 0 0 2px var(--primary)' : 'none'
                 }} />
               ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div style={{ textAlign: 'left', background: 'var(--bg-subtle)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Order Details</h4>
          <div style={{ fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
            <strong>Order ID:</strong> #{order.id.slice(-6).toUpperCase()}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {order.items.map((item: any, i: number) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total Amount</span>
            <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Link href="/menu" className="btn btn-outline" style={{ padding: '12px' }}>Order More</Link>
          <Link href="/" className="btn btn-primary" style={{ padding: '12px' }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
