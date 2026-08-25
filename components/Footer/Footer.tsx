import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoText}>THE RIDE</div>
            <p className={`text-telugu ${styles.logoSub}`}>రహదారుల నుండి.. జన హృదయాలలోకి</p>
            <p className={styles.tagline}>
              Eight journeys. Hundreds of people.<br />Countless moments. One unforgettable ride.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Navigate</h4>
              <a href="/#about">About the Book</a>
              <a href="/#book">Book Details</a>
              <a href="/#launch">Book Launch</a>
              <a href="/#reviews">Reviews</a>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Order</h4>
              <Link href="/order">Order the Book</Link>
              <Link href="/track">Track Your Order</Link>
              <Link href="/feedback">Submit Feedback</Link>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} <strong>The Ride</strong> by Pavan Akondi. All rights reserved.
          </p>
          <p className={styles.publisher}>Published by Eswari Publications</p>
        </div>
      </div>
    </footer>
  );
}
