'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<any>({});

  const [utr, setUtr] = useState('');

  useEffect(() => {
    // Load checkout data
    const data = sessionStorage.getItem('checkout_data');
    if (!data || items.length === 0) {
      router.push('/cart');
      return;
    }
    setCheckoutData(JSON.parse(data));

    // Load restaurant settings for UPI
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => setRestaurantSettings(data))
      .catch(console.error);
  }, [items, router]);

  if (!checkoutData) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const orderTotal = totalAmount + Math.round(totalAmount * 0.05);

  const confirmOrder = async () => {
    if (!utr || utr.trim().length < 6) {
      alert('Please enter a valid Transaction / UTR Number from your payment app.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          paymentMethod: 'UPI',
          notes: `UTR: ${utr.trim()}${checkoutData.notes ? ' | ' + checkoutData.notes : ''}`,
        }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      
      const order = await res.json();
      
      // Clear cart and checkout data
      clearCart();
      sessionStorage.removeItem('checkout_data');
      
      // Redirect to confirmation
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      alert('There was a problem processing your order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-title" style={{ paddingBottom: 'var(--space-md)' }}>
        <h1>Checkout</h1>
      </div>
      
      <div className="checkout-grid">
        <div className="order-summary" style={{ position: 'static' }}>
          <h3>Order Details</h3>
          
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <p><strong>Name:</strong> {checkoutData.customerName}</p>
            <p><strong>Phone:</strong> {checkoutData.customerPhone}</p>
            <p><strong>Type:</strong> {checkoutData.orderType === 'DINE_IN' ? `Dine In (Table ${checkoutData.tableNumber})` : 'Delivery'}</p>
            {checkoutData.orderType === 'DELIVERY' && (
              <p><strong>Address:</strong> {checkoutData.customerAddress}</p>
            )}
          </div>
          
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Items</h4>
          <ul style={{ listStyle: 'none', marginBottom: 'var(--space-lg)', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-xs) 0', borderBottom: '1px dashed var(--border-light)' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          
          <div className="summary-row total">
            <span>Total Payable</span>
            <span>₹{orderTotal}</span>
          </div>
        </div>
        
        <div className="payment-card">
          <h3>Payment Verification</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Please scan the QR code using any UPI app (GPay, PhonePe, Paytm) to make the payment.
          </p>
          
          <div className="qr-container">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(restaurantSettings.upi_qr_data || 'upi://pay?pa=restaurant@upi')}&margin=0`} 
              alt="UPI QR Code" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <div className="upi-id">
            UPI ID: {restaurantSettings.upi_id || 'restaurant@upi'}
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <label style={{ fontWeight: 600 }}>Enter Transaction ID (UTR) <span style={{ color: 'var(--error)' }}>*</span></label>
            <input 
              type="text" 
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 312345678901" 
              className="input-field"
              style={{ marginTop: '8px', padding: '12px', width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
              required 
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Your order will only be confirmed after verifying this transaction number.
            </p>
          </div>
          
          <button 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            onClick={confirmOrder}
            disabled={loading || utr.trim().length < 6}
          >
            {loading ? 'Processing...' : 'Confirm Payment & Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
