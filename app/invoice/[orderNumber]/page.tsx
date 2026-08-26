import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import styles from './invoice.module.css';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { orderNumber } = await params;

  // Fetch from Firestore
  const snapshot = await adminDb
    .collection('orders')
    .where('orderNumber', '==', decodeURIComponent(orderNumber))
    .limit(1)
    .get();

  if (snapshot.empty) notFound();

  const order = snapshot.docs[0].data();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <button 
        className={`${styles.printBtn} ${styles.noPrint}`} 
      >
        Print / Save as PDF
      </button>

      <div className={styles.invoiceContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>INVOICE</h1>
            <div className={styles.orderNumber}>Order ID: {order.orderNumber}</div>
            <div className={styles.orderNumber}>Date: {formatDate(order.orderDate)}</div>
          </div>
          <div className={styles.companyInfo}>
            <h2>THE RIDE</h2>
            <p>Eswari Publications</p>
            <p>pavan.akondi@gmail.com</p>
          </div>
        </div>

        {/* Addresses */}
        <div className={styles.grid}>
          <div className={styles.section}>
            <h3>Billed To:</h3>
            <p><strong>{order.customerName}</strong></p>
            <p>{order.mobile}</p>
            <p>{order.email}</p>
          </div>
          
          <div className={styles.section}>
            <h3>Shipped To:</h3>
            <p><strong>{order.customerName}</strong></p>
            <p>{order.address.house}, {order.address.street}</p>
            {order.address.landmark && <p>{order.address.landmark}</p>}
            <p>{order.address.city}, {order.address.state}</p>
            <p>{order.address.pincode}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Item Description</th>
              <th className={styles.right}>Price</th>
              <th className={styles.right}>Qty</th>
              <th className={styles.right}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>The Ride</strong><br/>
                <span style={{color: '#666', fontSize: '12px'}}>by Pavan Akondi</span>
              </td>
              <td className={styles.right}>₹{order.bookPrice}</td>
              <td className={styles.right}>{order.quantity}</td>
              <td className={styles.right}>₹{order.bookPrice * order.quantity}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>₹{order.bookPrice * order.quantity}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping:</span>
            <span>₹{order.deliveryCharge}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Discount:</span>
            <span>₹0</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total Paid:</span>
            <span>₹{order.totalAmount}</span>
          </div>
          <div className={styles.summaryRow} style={{marginTop: '10px', fontSize: '12px', color: '#16a34a'}}>
            <span>Payment Status:</span>
            <strong>{order.paymentStatus} via Razorpay</strong>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Thank you for purchasing The Ride!</p>
          <p>If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>
      
      {/* Inline script for the print button since this is a server component */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.querySelector('.${styles.printBtn}').addEventListener('click', function() {
            window.print();
          });
        `
      }} />
    </div>
  );
}
