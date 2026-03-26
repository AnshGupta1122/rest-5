'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    menuItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        // Fetch orders
        const ordersRes = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (ordersRes.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }
        
        const orders = await ordersRes.json();
        
        // Fetch menu items
        const menuRes = await fetch('/api/admin/menu', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const menuItems = await menuRes.json();
        
        // Calculate stats using strict IST bounds
        const ISTOffset = 5.5 * 60 * 60 * 1000;
        const nowUTC = new Date();
        const nowIST = new Date(nowUTC.getTime() + ISTOffset);
        
        const startOfTodayIST = new Date(nowIST);
        startOfTodayIST.setUTCHours(0, 0, 0, 0);
        
        const startOfTodayUTC = new Date(startOfTodayIST.getTime() - ISTOffset);
        
        const todayOrders = orders.filter((o: any) => new Date(o.createdAt) >= startOfTodayUTC);
        const revenue = todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const pending = todayOrders.filter((o: any) => o.status === 'PENDING').length;
        
        setStats({
          totalOrders: todayOrders.length,
          pendingOrders: pending,
          todayRevenue: revenue,
          menuItems: menuItems.length
        });
        
        setRecentOrders(todayOrders.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
        <div style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">₹</div>
          <div className="stat-info">
            <h4>Today's Revenue</h4>
            <div className="stat-value">₹{stats.todayRevenue.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders">📦</div>
          <div className="stat-info">
            <h4>Today's Orders</h4>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">🛎️</div>
          <div className="stat-info">
            <h4>Pending Orders</h4>
            <div className="stat-value">{stats.pendingOrders}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon items">🍔</div>
          <div className="stat-info">
            <h4>Menu Items</h4>
            <div className="stat-value">{stats.menuItems}</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-md)' }}>Recent Orders</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace' }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customerPhone}</div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text)' }}>
                      {order.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
