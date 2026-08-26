import Link from 'next/link';
import styles from './confirmation.module.css';
import { getAdminDb } from '@/lib/firebase-admin';
import { ORDER_STATUS, ESTIMATED_DELIVERY_DAYS } from '@/lib/constants';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;

  // Fetch from Firestore (server component)
  const snapshot = await getAdminDb()
    .collection('orders')
    .where('orderNumber', '==', decodeURIComponent(orderNumber))
    .limit(1)
    .get();

  if (snapshot.empty) notFound();

  const order = snapshot.docs[0].data();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          {/* Success Header */}
          <div className={styles.successHeader}>
            <div className="check-circle">✓</div>
            <div>
              <h1 className={styles.successTitle}>Order Confirmed!</h1>
              <p className={styles.successSubtitle}>
                Thank you for ordering <strong>The Ride</strong>. Your copy is on its way!
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className={styles.detailsGrid}>
            {/* Left: Order Info */}
            <div className={styles.orderDetails}>
              <div className="card">
                <div className={styles.orderId}>
                  <span className="label">Order ID</span>
                  <span className={styles.orderIdValue}>{order.orderNumber}</span>
                </div>

                <div className="divider" />

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Customer</span>
                  <span className={styles.detailValue}>{order.customerName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Mobile</span>
                  <span className={styles.detailValue}>{order.mobile}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{order.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Order Date</span>
                  <span className={styles.detailValue}>{formatDate(order.orderDate)}</span>
                </div>

                <div className="divider" />

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Delivering to</span>
                  <span className={styles.detailValue}>
                    {order.address.house}, {order.address.street}
                    {order.address.landmark && `, ${order.address.landmark}`},
                    {' '}{order.address.city}, {order.address.state} – {order.address.pincode}
                  </span>
                </div>

                <div className="divider" />

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Book</span>
                  <span className={styles.detailValue}>The Ride × {order.quantity}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment</span>
                  <span>
                    <span className="badge badge-success">{order.paymentStatus}</span>
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Paid</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>
                    ₹{order.totalAmount}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estimated Delivery</span>
                  <span className={styles.detailValue}>{ESTIMATED_DELIVERY_DAYS}</span>
                </div>
              </div>
            </div>

            {/* Right: Next Steps */}
            <div className={styles.nextSteps}>
              <div className="card">
                <h2 className={styles.nextStepsTitle}>What happens next?</h2>
                <div className={styles.stepsList}>
                  <div className={styles.nextStep}>
                    <div className={styles.nextStepDot}>1</div>
                    <div>
                      <div className={styles.nextStepLabel}>Order Processing</div>
                      <div className={styles.nextStepDesc}>We will verify your payment and process your order within 24 hours.</div>
                    </div>
                  </div>
                  <div className={styles.nextStep}>
                    <div className={styles.nextStepDot}>2</div>
                    <div>
                      <div className={styles.nextStepLabel}>Book Packed & Shipped</div>
                      <div className={styles.nextStepDesc}>Your copy of The Ride will be carefully packed and handed over to the courier.</div>
                    </div>
                  </div>
                  <div className={styles.nextStep}>
                    <div className={styles.nextStepDot}>3</div>
                    <div>
                      <div className={styles.nextStepLabel}>Delivered to You</div>
                      <div className={styles.nextStepDesc}>Expected delivery in {ESTIMATED_DELIVERY_DAYS}.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  Track Your Order
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Use your Order ID to track delivery status anytime
                </p>
                <div className={styles.orderIdBadge}>{order.orderNumber}</div>
              </div>

              <div className={styles.ctaButtons}>
                <Link href={`/invoice/${order.orderNumber}`} target="_blank" className="btn btn-primary w-full" style={{ justifyContent: 'center', background: '#333', borderColor: '#333', color: 'white', marginBottom: '10px' }} id="invoice-btn">
                  Download Invoice
                </Link>
                <Link href={`/track?order=${order.orderNumber}`} className="btn btn-primary w-full" style={{ justifyContent: 'center' }} id="track-order-btn">
                  Track My Order
                </Link>
                <Link href="/" className="btn btn-outline w-full" style={{ justifyContent: 'center' }} id="back-to-home-btn">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
