'use client';

import { useEffect, useState } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('TODAY');

  const fetchOrders = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      let url = '/api/orders?';
      if (filter !== 'ALL') url += `status=${filter}&`;
      if (timeFilter !== 'ALL_TIME') url += `timeFilter=${timeFilter}&`;
      
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filter, timeFilter]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      // Optimistic update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
      fetchOrders(); // Revert on error
    }
  };

  const markAsPaid = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      setOrders(orders.map(o => o.id === id ? { ...o, isPaid: true } : o));
      
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPaid: true })
      });
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="admin-header" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Order Management</h1>
          <select 
            value={timeFilter} 
            onChange={(e) => { setLoading(true); setTimeFilter(e.target.value); }}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              background: 'var(--bg-card)', 
              color: 'var(--text)',
              fontSize: '0.9rem' 
            }}
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_10_DAYS">Last 10 Days</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
        
        <div className="category-tabs" style={{ marginBottom: 0 }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
            <button 
              key={status}
              className={`category-tab ${filter === status ? 'active' : ''}`}
              onClick={() => { setLoading(true); setFilter(status); }}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, marginBottom: '4px' }}>
                      #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <span className="status-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}>
                      {order.type.replace('_', ' ')}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.85rem' }}>{order.customerPhone}</div>
                    {order.type === 'DINE_IN' && order.tableNumber && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                        Table {order.tableNumber}
                      </div>
                    )}
                    {order.type === 'DELIVERY' && order.customerAddress && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '200px' }}>
                        {order.customerAddress}
                      </div>
                    )}
                    {order.type === 'DELIVERY' && order.notes && order.notes.includes('GPS:') && (() => {
                      const gpsMatch = order.notes.match(/GPS:([\d.-]+),([\d.-]+)/);
                      if (!gpsMatch) return null;
                      return (
                        <a
                          href={`https://www.google.com/maps?q=${gpsMatch[1]},${gpsMatch[2]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem', color: '#1976d2', textDecoration: 'none', padding: '3px 8px', background: '#e3f2fd', borderRadius: '4px', fontWeight: 600 }}
                        >
                          📍 View on Map
                        </a>
                      );
                    })()}
                  </td>
                  <td>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                      {order.items.map((item: any, i: number) => (
                        <li key={i} style={{ marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      ₹{order.totalAmount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      via {order.paymentMethod}
                    </div>
                    {order.notes && order.notes.includes('UTR:') && (
                      <div style={{ fontSize: '0.8rem', background: '#fff3e0', border: '1px solid #ffe0b2', padding: '4px', borderRadius: '4px', margin: '4px 0', wordBreak: 'break-all' }}>
                        <strong>{order.notes}</strong>
                      </div>
                    )}
                    {order.isPaid ? (
                      <span className="status-badge ready" style={{ fontSize: '0.7rem' }}>Paid Verified</span>
                    ) : (
                      <button 
                        className="btn btn-warning btn-sm" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px', border: 'none', background: '#f57c00', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => markAsPaid(order.id)}
                      >
                        Verify & Mark Paid
                      </button>
                    )}
                  </td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: 'var(--radius-full)', 
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        color: order.status === 'PENDING' ? '#e65100' :
                               (order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') ? '#2e7d32' : 
                               order.status === 'CANCELLED' ? '#d50000' : 'inherit'
                      }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="actions">
                      <a 
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `*Spice Garden - Order Bill*\n` +
                          `Order ID: #${order.id.slice(-6).toUpperCase()}\n` +
                          `Name: ${order.customerName}\n` +
                          (order.type === 'DINE_IN' ? `Table: ${order.tableNumber}\n` : `Type: Delivery\n`) +
                          `Status: ${order.status.replace(/_/g, ' ')}\n\n` +
                          `*Items ordered:*\n` +
                          order.items.map((i: any) => `${i.quantity}x ${i.name} - ₹${i.price * i.quantity}`).join('\n') +
                          `\n\n*Subtotal:* ₹${order.totalAmount}\n` +
                          `*Taxes (5%):* ₹${Math.round(order.totalAmount * 0.05)}\n` +
                          `*Total Paid:* ₹${order.totalAmount + Math.round(order.totalAmount * 0.05)}\n` +
                          `*Payment via:* ${order.paymentMethod}\n\n` +
                          `Thank you for ordering with us!`
                        )}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                      >
                        <span style={{ fontSize: '1rem' }}>📱</span> Send Bill
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
