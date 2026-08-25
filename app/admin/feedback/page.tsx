'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './feedback.module.css';

interface FeedbackItem {
  id: string;
  customerName: string;
  rating: number;
  feedback: string;
  recommend: 'YES' | 'MAYBE' | 'NO';
  createdAt: number;
  approved: boolean;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [filterRecommend, setFilterRecommend] = useState<string>('ALL');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')));
      setFeedback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedbackItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'feedback', id), { approved: !current });
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, approved: !current } : f))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update approval status.');
    }
  };

  const deleteSingleFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback forever?')) return;
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedback((prev) => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete feedback.');
    }
  };

  const filteredFeedback = useMemo(() => {
    return feedback.filter(fb => {
      const matchRating = filterRating === 'ALL' || fb.rating === parseInt(filterRating);
      const matchRecommend = filterRecommend === 'ALL' || fb.recommend === filterRecommend;
      return matchRating && matchRecommend;
    });
  }, [feedback, filterRating, filterRecommend]);

  const clearAllFiltered = async () => {
    if (filteredFeedback.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete these ${filteredFeedback.length} feedbacks? This cannot be undone.`)) return;
    
    try {
      const batch = writeBatch(db);
      filteredFeedback.forEach(fb => {
        batch.delete(doc(db, 'feedback', fb.id));
      });
      await batch.commit();
      
      // Remove them from local state
      const deletedIds = new Set(filteredFeedback.map(f => f.id));
      setFeedback(prev => prev.filter(f => !deletedIds.has(f.id)));
    } catch (err) {
      console.error(err);
      alert('Failed to clear feedbacks.');
    }
  };

  const downloadCSV = () => {
    if (filteredFeedback.length === 0) return;
    
    // Create CSV header
    const headers = ['Date', 'Name', 'Rating', 'Recommended', 'Approved', 'Feedback Text'];
    
    // Create rows
    const rows = filteredFeedback.map(fb => {
      return [
        new Date(fb.createdAt).toLocaleDateString('en-IN'),
        `"${(fb.customerName || 'Anonymous').replace(/"/g, '""')}"`,
        fb.rating,
        fb.recommend,
        fb.approved ? 'Yes' : 'No',
        `"${fb.feedback.replace(/"/g, '""')}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `feedback_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading feedback...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Feedback</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {feedback.length} total submissions · {feedback.filter((f) => f.approved).length} approved (shown on homepage)
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={downloadCSV}
            disabled={filteredFeedback.length === 0}
          >
            📥 Download CSV
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={clearAllFiltered}
            disabled={filteredFeedback.length === 0}
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
          >
            🗑️ Clear All ({filteredFeedback.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filters:</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem' }}>Rating:</label>
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '0.25rem 0.75rem', minHeight: 'auto', fontSize: '0.875rem' }}
            value={filterRating}
            onChange={e => setFilterRating(e.target.value)}
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem' }}>Recommendation:</label>
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '0.25rem 0.75rem', minHeight: 'auto', fontSize: '0.875rem' }}
            value={filterRecommend}
            onChange={e => setFilterRecommend(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="MAYBE">Maybe</option>
          </select>
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          No feedback matches your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredFeedback.map((fb) => (
            <div
              key={fb.id}
              className="card"
              style={{ borderColor: fb.approved ? 'rgba(201,168,76,0.3)' : 'var(--color-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '1rem', letterSpacing: '2px' }}>
                      {stars(fb.rating)}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {fb.customerName || 'Anonymous'}
                    </span>
                    <span className={`badge ${fb.recommend === 'YES' ? 'badge-success' : fb.recommend === 'NO' ? 'badge-error' : 'badge-warning'}`}>
                      {fb.recommend === 'YES' ? '👍 Recommends' : fb.recommend === 'NO' ? '👎 Not Recommended' : '🤔 Maybe'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(fb.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                    &ldquo;{fb.feedback}&rdquo;
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {fb.approved && (
                    <span className="badge badge-gold" style={{ marginRight: '0.5rem' }}>Homepage</span>
                  )}
                  <button
                    className={`btn btn-sm ${fb.approved ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => toggleApproval(fb.id, fb.approved)}
                    title={fb.approved ? 'Remove from Homepage' : 'Approve to Homepage'}
                  >
                    {fb.approved ? 'Remove' : 'Approve'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    onClick={() => deleteSingleFeedback(fb.id)}
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
