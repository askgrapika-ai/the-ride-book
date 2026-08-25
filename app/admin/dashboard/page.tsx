'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './dashboard.module.css';
import { ORDER_STATUS, type OrderStatusKey } from '@/lib/constants';

interface DashboardStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  availableStock: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const paid = orders.filter((o) => (o as Record<string, unknown>).paymentStatus === 'PAID');
        const pending = orders.filter((o) => (o as Record<string, unknown>).paymentStatus === 'PENDING');
        const delivered = orders.filter((o) => (o as Record<string, unknown>).orderStatus === 'DELIVERED');
        const revenue = paid.reduce((sum, o) => sum + ((o as Record<string, unknown>).totalAmount as number || 0), 0);

        setStats({
          totalOrders: orders.length,
          paidOrders: paid.length,
          pendingOrders: pending.length,
          deliveredOrders: delivered.length,
          totalRevenue: revenue,
          availableStock: 0,
        });

        // Recent 5 orders
        const sorted = [...orders].sort((a, b) => {
          const aTime = (a as Record<string, unknown>).createdAt as number;
          const bTime = (b as Record<string, unknown>).createdAt as number;
          return bTime - aTime;
        });
        setRecentOrders(sorted.slice(0, 5) as Record<string, unknown>[]);

        // Fetch stock
        const bookSnap = await getDocs(collection(db, 'book'));
        if (!bookSnap.empty) {
          const bookData = bookSnap.docs[0].data();
          setStats((prev) => prev ? { ...prev, availableStock: bookData.availableStock || 0 } : prev);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>The Ride – Book Sales Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className={styles.statLabel}>Total Orders</div>
          <div className="stat-value">{stats?.totalOrders ?? 0}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div className={styles.statLabel}>Paid Orders</div>
          <div className="stat-value" style={{ color: '#4ade80' }}>{stats?.paidOrders ?? 0}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          <div className={styles.statLabel}>Pending Payment</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{stats?.pendingOrders ?? 0}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className="stat-value gradient-text">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className={styles.statLabel}>Delivered</div>
          <div className="stat-value">{stats?.deliveredOrders ?? 0}</div>
        </div>
        <div className="stat-card" style={{ borderColor: stats?.availableStock === 0 ? 'rgba(239, 68, 68, 0.3)' : undefined }}>
          <div className={styles.statLabel}>Available Stock</div>
          <div className="stat-value" style={{ color: stats?.availableStock === 0 ? '#f87171' : undefined }}>
            {stats?.availableStock ?? '—'}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn-outline btn-sm">View All →</Link>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id as string}>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {order.orderNumber as string}
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{order.customerName as string}</td>
                    <td>{formatDate(order.createdAt as number)}</td>
                    <td style={{ fontWeight: 600 }}>₹{(order.totalAmount as number)?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : order.paymentStatus === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                        {order.paymentStatus as string}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted">
                        {ORDER_STATUS[order.orderStatus as OrderStatusKey]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id as string}`} className="btn btn-ghost btn-sm">View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
