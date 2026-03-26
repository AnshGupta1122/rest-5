'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Script from 'next/script';

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

  const confirmOrder = async (razorpayPaymentId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          paymentMethod: 'Razorpay',
          notes: razorpayPaymentId ? `Razorpay Payment ID: ${razorpayPaymentId} | ${checkoutData.notes || ''}` : checkoutData.notes,
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

  const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: orderTotal }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (orderData.missing_keys) {
          alert('Razorpay keys are missing in the .env file. Running in fallback mode.');
          // Fallback just to place order
          confirmOrder('fallback-dev-mode');
          return;
        }
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // 2. Initialize Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOURKEY',
        amount: orderData.amount,
        currency: orderData.currency,
        name: restaurantSettings.restaurant_name || 'Spice Garden',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async function (response: any) {
          // Success callback
          await confirmOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: checkoutData.customerName,
          contact: checkoutData.customerPhone,
        },
        theme: {
          color: '#e65100', // Matches brand primary color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
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
            <h3>Online Payment</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Pay securely via UPI, Credit/Debit Card, or Netbanking using Razorpay.
            </p>
            
            <div style={{ background: 'var(--bg-subtle)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
               <h2 style={{ color: 'var(--primary)', marginBottom: '4px' }}>₹{orderTotal}</h2>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secured by Razorpay</p>
            </div>
            
            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}
              onClick={handleRazorpayPayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
              By tapping Pay Now, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
