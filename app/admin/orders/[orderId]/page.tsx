'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ORDER_STATUS, type OrderStatusKey } from '@/lib/constants';
import Link from 'next/link';
import styles from './orderDetail.module.css';

const STATUS_OPTIONS: OrderStatusKey[] = [
  'ORDER_PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED',
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editable fields
  const [orderStatus, setOrderStatus] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (!snap.exists()) { router.replace('/admin/orders'); return; }
        const data = { id: snap.id, ...snap.data() } as Record<string, unknown>;
        setOrder(data);
        setOrderStatus(data.orderStatus as string || '');
        setEstimatedDelivery(data.estimatedDelivery as string || '');
        setCourierName(data.courierName as string || '');
        setTrackingNumber(data.trackingNumber as string || '');
        setTrackingUrl(data.trackingUrl as string || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();

      const res = await fetch('/api/admin/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          updates: { orderStatus, estimatedDelivery, courierName, trackingNumber, trackingUrl },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh order
      const snap = await getDoc(doc(db, 'orders', orderId));
      setOrder({ id: snap.id, ...snap.data() } as Record<string, unknown>);
      setSuccess('Order updated successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>Loading order...</div>;
  if (!order) return null;

  const address = order.address as Record<string, string>;
  const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Link href="/admin/orders" className={styles.backLink}>← Back to Orders</Link>
          <h1 className={styles.title}>{order.orderNumber as string}</h1>
          <p className={styles.subtitle}>Ordered on {formatDate(order.orderDate as string)}</p>
        </div>
        <div className={styles.badges}>
          <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
            {order.paymentStatus as string}
          </span>
          <span className="badge badge-muted">
            {ORDER_STATUS[order.orderStatus as OrderStatusKey]}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left: Order Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer */}
          <div className="card">
            <h2 className={styles.cardTitle}>Customer Information</h2>
            <div className={styles.infoGrid}>
              <InfoRow label="Name" value={order.customerName as string} />
              <InfoRow label="Mobile" value={order.mobile as string} />
              <InfoRow label="Email" value={order.email as string} />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card">
            <h2 className={styles.cardTitle}>Delivery Address</h2>
            <div className={styles.addressBlock}>
              {address.house}, {address.street}
              {address.landmark && `, ${address.landmark}`}
              <br />
              {address.city}, {address.state} – {address.pincode}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h2 className={styles.cardTitle}>Order Summary</h2>
            <div className={styles.infoGrid}>
              <InfoRow label="Book" value={`The Ride × ${order.quantity}`} />
              <InfoRow label="Book Price" value={`₹${order.bookPrice}`} />
              <InfoRow label="Delivery" value={order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`} />
              <InfoRow label="Total" value={`₹${order.totalAmount}`} highlight />
              <InfoRow label="Payment ID" value={(order.razorpayPaymentId as string) || '—'} mono />
              <InfoRow label="Razorpay Order ID" value={(order.razorpayOrderId as string) || '—'} mono />
            </div>
          </div>
        </div>

        {/* Right: Update Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 className={styles.cardTitle}>Update Order</h2>
            <div className={styles.updateForm}>
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  className="form-input"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  id="order-status-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS[s]}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Delivery</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 28 Aug 2026"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  id="estimated-delivery-input"
                />
              </div>

              <div className={styles.sectionLabel}>Courier Information</div>

              <div className="form-group">
                <label className="form-label">Courier Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., DTDC, India Post"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  id="courier-name-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tracking / AWB number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  id="tracking-number-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tracking URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  id="tracking-url-input"
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.successMsg}>✓ {success}</div>}

              <button
                className="btn btn-primary w-full"
                onClick={handleSave}
                disabled={saving}
                id="save-order-btn"
                style={{ justifyContent: 'center' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue} style={{
        color: highlight ? 'var(--color-gold)' : undefined,
        fontWeight: highlight ? 700 : undefined,
        fontFamily: mono ? 'monospace' : undefined,
        fontSize: mono ? '0.8rem' : undefined,
      }}>
        {value}
      </span>
    </div>
  );
}
