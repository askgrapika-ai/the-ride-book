'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './order.module.css';
import { BOOK } from '@/lib/constants';

export default function OrderPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const bookPrice = BOOK.price;
  const deliveryCharge = BOOK.deliveryCharge;
  const total = bookPrice * quantity + deliveryCharge;

  const handleContinue = () => {
    // Store order state in sessionStorage for the checkout flow
    sessionStorage.setItem('orderState', JSON.stringify({ quantity, bookPrice, deliveryCharge, total, totalAmount: total }));
    router.push('/checkout');
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Progress */}
        <div className="checkout-progress">
          <div className="progress-step active">
            <div className="progress-dot">1</div>
            <span>Order</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className="progress-dot">2</div>
            <span>Address</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className="progress-dot">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className={styles.inner}>
          {/* Book Card */}
          <div className={styles.bookCard}>
            <div className={styles.bookCover}>
              <div style={{ width: '140px', height: '200px', overflow: 'hidden', borderRadius: '6px', flexShrink: 0 }}>
                <img src="/images/book%20.jpeg" alt="The Ride Book Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className={styles.bookCardInfo}>
              <div className="label">Order</div>
              <h1 className={`display-md ${styles.bookTitle}`}>THE RIDE</h1>
              <p className={`text-telugu ${styles.bookSubtitle}`}>{BOOK.subtitle}</p>
              <p className={styles.bookAuthor}>by {BOOK.author}</p>
              <div className={styles.bookPrice}>₹{bookPrice}</div>

              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className="qty-selector" id="quantity-selector">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.summarySection}>
            <div className="order-summary">
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className="order-summary-row">
                <span>The Ride × {quantity}</span>
                <span>₹{bookPrice * quantity}</span>
              </div>
              <div className="order-summary-row">
                <span>Delivery Charge</span>
                <span style={{ color: 'var(--color-gold)' }}>
                  {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="order-summary-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className={styles.deliveryNote}>
              <span>🚚</span>
              <span>Delivery in 2–4 working days. Delivery charges may apply based on location.</span>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleContinue}
              id="continue-to-checkout-btn"
              style={{ justifyContent: 'center' }}
            >
              Continue →
            </button>

            <Link href="/" className={`btn btn-ghost ${styles.backBtn}`}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
