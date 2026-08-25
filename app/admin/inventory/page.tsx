'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './inventory.module.css';

interface BookInventory {
  totalStock: number;
  availableStock: number;
  soldCount: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<BookInventory | null>(null);
  const [newStock, setNewStock] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const bookRef = doc(db, 'book', 'the-ride');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snap = await getDoc(bookRef);
        if (snap.exists()) {
          const data = snap.data() as BookInventory;
          setInventory(data);
          setNewStock(String(data.availableStock));
        } else {
          // Initialize book data
          const initial: BookInventory = { totalStock: 300, availableStock: 250, soldCount: 50 };
          await setDoc(bookRef, {
            ...initial,
            title: 'The Ride',
            author: 'Pavan Akondi',
            price: 150,
            deliveryCharge: 0,
            pages: 137,
            language: 'Telugu',
            publisher: 'Eswari Publications',
            edition: '1st Edition, 2026',
          });
          setInventory(initial);
          setNewStock('250');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleUpdateStock = async () => {
    const parsed = parseInt(newStock);
    if (isNaN(parsed) || parsed < 0) { setMessage('Please enter a valid stock number'); return; }
    setSaving(true);
    try {
      await setDoc(bookRef, { availableStock: parsed }, { merge: true });
      setInventory((prev) => prev ? { ...prev, availableStock: parsed } : prev);
      setMessage('✓ Stock updated successfully');
    } catch {
      setMessage('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading inventory...</div>;

  const stockPercent = inventory ? Math.round((inventory.availableStock / inventory.totalStock) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Inventory</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>The Ride – Stock Management</p>
      </div>

      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className={styles.statLabel}>Total Stock (Initial)</div>
          <div className="stat-value">{inventory?.totalStock}</div>
          <div className={styles.statNote}>Total copies printed/ordered</div>
        </div>
        <div className="stat-card" style={{ borderColor: inventory?.availableStock === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(201,168,76,0.2)' }}>
          <div className={styles.statLabel}>Available Stock</div>
          <div className="stat-value" style={{ color: inventory?.availableStock === 0 ? '#f87171' : 'var(--color-gold)' }}>
            {inventory?.availableStock}
          </div>
          <div className={styles.statNote}>{inventory?.availableStock === 0 ? '⚠️ Out of Stock' : 'Ready to ship'}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div className={styles.statLabel}>Books Sold</div>
          <div className="stat-value" style={{ color: '#4ade80' }}>{inventory?.soldCount}</div>
          <div className={styles.statNote}>Successful deliveries</div>
        </div>
      </div>

      {/* Stock Bar */}
      <div className={`card ${styles.stockCard}`} style={{ marginTop: '2rem' }}>
        <h2 className={styles.cardTitle}>Stock Level</h2>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${stockPercent}%`,
              background: stockPercent < 20 ? '#f87171' : stockPercent < 50 ? '#fbbf24' : 'var(--color-gold)',
            }}
          />
        </div>
        <div className={styles.progressLabel}>{stockPercent}% remaining ({inventory?.availableStock} of {inventory?.totalStock})</div>
      </div>

      {/* Update Stock */}
      <div className="card" style={{ marginTop: '1.5rem', maxWidth: '480px' }}>
        <h2 className={styles.cardTitle}>Update Available Stock</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Set the current available stock count. This decreases automatically when orders are paid.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Available Stock</label>
            <input
              type="number"
              className="form-input"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              min={0}
              id="stock-input"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleUpdateStock}
            disabled={saving}
            id="update-stock-btn"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
        {message && (
          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: message.startsWith('✓') ? '#4ade80' : '#f87171',
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className={styles.cardTitle}>Book Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            ['Title', 'The Ride'],
            ['Author', 'Pavan Akondi'],
            ['Price', '₹150'],
            ['Language', 'Telugu'],
            ['Pages', '137'],
            ['Publisher', 'Eswari Publications'],
            ['Edition', '1st Edition, 2026'],
            ['Delivery Charge', 'Free'],
          ].map(([key, val]) => (
            <div key={key} style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{key}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
