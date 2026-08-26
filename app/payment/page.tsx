'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './payment.module.css';
import { CartState, CheckoutForm, RazorpayOptions, RazorpayResponse } from '@/lib/types';
import { BOOK } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [orderState, setOrderState] = useState<CartState | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('orderState');
    const form = sessionStorage.getItem('checkoutForm');
    if (!stored || !form) {
      router.replace('/order');
      return;
    }
    setOrderState(JSON.parse(stored));
    setCheckoutForm(JSON.parse(form));

    // Load Razorpay script
    if (!document.querySelector('script[src*="razorpay"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [router]);

  const handlePayment = async () => {
    if (!orderState || !checkoutForm) return;
    setLoading(true);
    setError('');

    try {
      // Step 1: Create Razorpay order on backend
      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: orderState.quantity,
          bookPrice: orderState.bookPrice,
          deliveryCharge: orderState.deliveryCharge,
          totalAmount: orderState.total,
          customerName: checkoutForm.customerName,
          mobile: checkoutForm.mobile,
          email: checkoutForm.email,
          address: {
            house: checkoutForm.house,
            street: checkoutForm.street,
            city: checkoutForm.city,
            state: checkoutForm.state,
            pincode: checkoutForm.pincode,
            landmark: checkoutForm.landmark,
          },
        }),
      });

      let createData;
      try {
        const textResponse = await createRes.clone().text();
        if (!createRes.ok && textResponse.includes('Internal Server Error')) {
            throw new Error(`Vercel 500 Error: Firebase Admin keys are likely formatted incorrectly. Check Vercel logs.`);
        }
        if (!textResponse) {
          throw new Error('Server returned an empty response. Check Vercel Runtime Logs.');
        }
        createData = await createRes.json();
      } catch (e: any) {
        throw new Error(e.message || 'Server Error: Failed to parse response.');
      }

      if (!createRes.ok) {
        throw new Error(createData?.error || 'Failed to create order');
      }
      const { razorpayOrderId, firestoreOrderId } = createData;

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderState.total * 100, // paise
        currency: 'INR',
        name: 'The Ride',
        description: `The Ride × ${orderState.quantity}`,
        order_id: razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment on backend
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              firestoreOrderId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
            return;
          }

          // Clear session state
          sessionStorage.removeItem('orderState');
          sessionStorage.removeItem('checkoutForm');

          // Redirect to confirmation
          router.push(`/confirmation/${verifyData.orderNumber}`);
        },
        prefill: {
          name: checkoutForm.customerName,
          email: checkoutForm.email,
          contact: checkoutForm.mobile,
        },
        theme: {
          color: '#c9a84c',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!orderState || !checkoutForm) return null;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Progress */}
        <div className="checkout-progress">
          <div className="progress-step done">
            <div className="progress-dot">✓</div>
            <span>Order</span>
          </div>
          <div className="progress-line" style={{ background: 'var(--color-gold)' }} />
          <div className="progress-step done">
            <div className="progress-dot">✓</div>
            <span>Address</span>
          </div>
          <div className="progress-line" style={{ background: 'var(--color-gold)' }} />
          <div className="progress-step active">
            <div className="progress-dot">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className={styles.inner}>
          {/* Order Review */}
          <div className={styles.reviewSection}>
            {/* Order Summary */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              <div className={styles.reviewBook}>
                <div style={{ width: '70px', height: '100px', borderRadius: '6px', overflow: 'hidden' }}>
                  <img src="/images/book%20.jpeg" alt="The Ride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>The Ride</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    by {BOOK.author}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Qty: {orderState.quantity}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                  ₹{BOOK.price * orderState.quantity}
                </div>
              </div>

              <div className="divider" />

              <div className="order-summary-row">
                <span>Book × {orderState.quantity}</span>
                <span>₹{BOOK.price * orderState.quantity}</span>
              </div>
              <div className="order-summary-row">
                <span>Delivery Charge</span>
                <span style={{ color: 'var(--color-gold)' }}>
                  {orderState.deliveryCharge === 0 ? 'Free' : `₹${orderState.deliveryCharge}`}
                </span>
              </div>
              <div className="order-summary-row total">
                <span>Total Amount</span>
                <span>₹{orderState.total}</span>
              </div>
            </div>

            {/* Delivery Address Review */}
            <div className="card">
              <h2 className={styles.sectionTitle}>Delivering to</h2>
              <div className={styles.addressReview}>
                <div className={styles.addressName}>{checkoutForm.customerName}</div>
                <div className={styles.addressText}>
                  {checkoutForm.house}, {checkoutForm.street}
                  {checkoutForm.landmark && `, ${checkoutForm.landmark}`}
                  <br />
                  {checkoutForm.city}, {checkoutForm.state} – {checkoutForm.pincode}
                </div>
                <div className={styles.addressPhone}>📞 {checkoutForm.mobile}</div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className={styles.paymentSection}>
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Secure Payment</h2>

              <div className={styles.totalDisplay}>
                <div className={styles.totalLabel}>Total to Pay</div>
                <div className={styles.totalAmount}>₹{orderState.total}</div>
              </div>

              <div className={styles.paymentMethods}>
                <div className={styles.paymentMethodsLabel}>Accepted Payment Methods</div>
                <div className={styles.paymentIcons}>
                  <span className={styles.paymentIcon}>💳</span>
                  <span className={styles.paymentIconLabel}>UPI</span>
                  <span className={styles.paymentIcon}>🏦</span>
                  <span className={styles.paymentIconLabel}>Net Banking</span>
                  <span className={styles.paymentIcon}>📱</span>
                  <span className={styles.paymentIconLabel}>Wallets</span>
                  <span className={styles.paymentIcon}>💰</span>
                  <span className={styles.paymentIconLabel}>Cards</span>
                </div>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  ⚠️ {error}
                </div>
              )}

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handlePayment}
                disabled={loading}
                id="pay-now-btn"
                style={{ justifyContent: 'center', marginTop: '1.5rem' }}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}>
                    <span className={styles.spinner} /> Processing...
                  </span>
                ) : (
                  `Pay ₹${orderState.total} Securely`
                )}
              </button>

              <div className={styles.secureTag}>
                🔒 Powered by Razorpay · 100% Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
