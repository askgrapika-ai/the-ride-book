'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './track.module.css';
import { ORDER_STATUS, type OrderStatusKey } from '@/lib/constants';

const STATUS_STEPS: OrderStatusKey[] = [
  'ORDER_PLACED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

interface TrackOrder {
  orderNumber: string;
  customerName: string;
  address: { house: string; street: string; city: string; state: string; pincode: string; landmark?: string };
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: OrderStatusKey;
  orderDate: string;
  estimatedDelivery?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

function TrackForm() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleSearch = async (orderNum?: string) => {
    const query = (orderNum || input).trim().toUpperCase();
    if (!query) { setError('Please enter your order number'); return; }
    if (!query.startsWith('TR-')) { setError('Order numbers start with TR- (e.g., TR-2026-000001)'); return; }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setOrder(data);
    } catch {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preloaded = searchParams.get('order');
    if (preloaded) {
      handleSearch(preloaded);
    }
  }, []);

  const currentStatusIndex = order
    ? STATUS_STEPS.indexOf(order.orderStatus as OrderStatusKey)
    : -1;

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="label">Delivery Tracking</div>
            <h1 className="display-md">Track Your Order</h1>
            <p>Enter your Order ID to see the current delivery status</p>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <div className={styles.searchRow}>
              <input
                type="text"
                className={`form-input ${styles.searchInput}`}
                placeholder="e.g., TR-2026-000001"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                id="order-number-input"
              />
              <button
                className={`btn btn-primary ${styles.searchBtn}`}
                onClick={() => handleSearch()}
                disabled={loading}
                id="track-search-btn"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
            {error && <div className={styles.errorMsg}>⚠️ {error}</div>}
          </div>

          {/* Order Tracking Result */}
          {order && (
            <div className={styles.result}>
              <div className={styles.resultGrid}>
                {/* Status Stepper */}
                <div className="card">
                  <div className={styles.statusHeader}>
                    <div>
                      <div className="label">Current Status</div>
                      <div className={styles.currentStatus}>
                        {ORDER_STATUS[order.orderStatus as OrderStatusKey]}
                      </div>
                    </div>
                    <div className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-success' : 'badge-gold'}`}>
                      {order.orderStatus === 'DELIVERED' ? '✓ Delivered' : 'In Progress'}
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="stepper">
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = i < currentStatusIndex;
                      const isActive = i === currentStatusIndex;
                      const isLast = i === STATUS_STEPS.length - 1;

                      return (
                        <div
                          key={step}
                          className={`stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                          style={isLast ? { '--stepper-last': '1' } as React.CSSProperties : {}}
                        >
                          <div className="stepper-dot">
                            {isCompleted ? '✓' : i + 1}
                          </div>
                          <div className="stepper-content">
                            <div className="stepper-label">{ORDER_STATUS[step]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card">
                    <h3 className={styles.cardTitle}>Order Details</h3>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Order ID</span>
                      <span className={styles.infoValue} style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Ordered On</span>
                      <span className={styles.infoValue}>{formatDate(order.orderDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Book</span>
                      <span className={styles.infoValue}>The Ride × {order.quantity}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Customer</span>
                      <span className={styles.infoValue}>{order.customerName}</span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Est. Delivery</span>
                        <span className={styles.infoValue}>{order.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3 className={styles.cardTitle}>Delivering to</h3>
                    <div className={styles.addressBlock}>
                      <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {order.address.house}, {order.address.street}
                        {order.address.landmark && `, ${order.address.landmark}`}<br />
                        {order.address.city}, {order.address.state} – {order.address.pincode}
                      </div>
                    </div>
                  </div>

                  {/* Courier Info */}
                  {order.courierName && (
                    <div className="card" style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
                      <h3 className={styles.cardTitle}>Courier Information</h3>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Courier</span>
                        <span className={styles.infoValue}>{order.courierName}</span>
                      </div>
                      {order.trackingNumber && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Tracking No.</span>
                          <span className={styles.infoValue}>{order.trackingNumber}</span>
                        </div>
                      )}
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ marginTop: '0.75rem' }}
                        >
                          Track on Courier Website →
                        </a>
                      )}
                    </div>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <div className={styles.feedbackPrompt}>
                      <div>📚 Enjoyed the book? Share your experience!</div>
                      <a href="/feedback" className="btn btn-primary btn-sm" id="leave-feedback-btn">
                        Leave Feedback
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading...</div>}>
      <TrackForm />
    </Suspense>
  );
}
