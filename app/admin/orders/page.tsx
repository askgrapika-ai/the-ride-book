'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ORDER_STATUS, type OrderStatusKey } from '@/lib/constants';
import styles from './orders.module.css';

const PAYMENT_BADGE: Record<string, string> = {
  PAID: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-error',
  CANCELLED: 'badge-muted',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
        data.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'ALL' ? orders :
    orders.filter((o) => filter === 'PAID' ? o.paymentStatus === 'PAID' :
      filter === 'PENDING' ? o.paymentStatus === 'PENDING' :
      o.orderStatus === filter);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {['ALL', 'PAID', 'PENDING', 'SHIPPED', 'DELIVERED'].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
            id={`filter-${f.toLowerCase()}-btn`}
          >
            {f === 'ALL' ? 'All Orders' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No orders found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id as string}>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {order.orderNumber as string}
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{order.customerName as string}</td>
                    <td>{order.mobile as string}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(order.createdAt as number)}</td>
                    <td>{order.quantity as number}</td>
                    <td style={{ fontWeight: 600 }}>₹{(order.totalAmount as number)?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${PAYMENT_BADGE[order.paymentStatus as string] || 'badge-muted'}`}>
                        {order.paymentStatus as string}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                        {ORDER_STATUS[order.orderStatus as OrderStatusKey] || order.orderStatus as string}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id as string}`} className="btn btn-ghost btn-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
