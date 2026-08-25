'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './feedback.module.css';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [form, setForm] = useState({ customerName: '', feedback: '', recommend: '' as 'YES' | 'MAYBE' | 'NO' | '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    if (!form.feedback.trim()) { setError('Please share your feedback'); return; }
    if (!form.recommend) { setError('Please select your recommendation'); return; }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'feedback'), {
        customerName: form.customerName.trim() || 'Anonymous',
        rating,
        feedback: form.feedback.trim(),
        recommend: form.recommend,
        createdAt: Date.now(),
        approved: false,
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.successState}>
            <div className="check-circle" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>🎉</div>
            <h1 className={styles.successTitle}>Thank You!</h1>
            <p className={styles.successDesc}>
              Your feedback has been submitted successfully. We appreciate you sharing your experience with <em>The Ride</em>.
            </p>
            <a href="/" className="btn btn-primary" id="back-home-from-feedback-btn">Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <div className="label">Reader Feedback</div>
            <h1 className="display-md">Share Your Experience</h1>
            <p>Your feedback helps us and future readers of The Ride</p>
          </div>

          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Star Rating */}
              <div className={styles.ratingSection}>
                <div className={styles.ratingLabel}>Your Rating *</div>
                <div className="star-rating" role="group" aria-label="Rating">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= (hovered || rating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star`}
                      id={`star-${star}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className={styles.ratingText}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </div>
                )}
              </div>

              {/* Feedback Text */}
              <div className="form-group">
                <label htmlFor="feedback" className="form-label">
                  Your Feedback <span style={{ color: '#f87171' }}>*</span>
                </label>
                <textarea
                  id="feedback"
                  className={`form-input ${styles.textarea}`}
                  placeholder="Share your thoughts about The Ride — what did you enjoy? What moved you? How did it impact you?"
                  value={form.feedback}
                  onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                  rows={5}
                />
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="customerName" className="form-label">Your Name (Optional)</label>
                <input
                  id="customerName"
                  type="text"
                  className="form-input"
                  placeholder="Leave blank to remain anonymous"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                />
              </div>

              {/* Recommend */}
              <div className={styles.recommendSection}>
                <div className={styles.recommendLabel}>Would you recommend The Ride? *</div>
                <div className={styles.recommendOptions}>
                  {(['YES', 'MAYBE', 'NO'] as const).map((option) => (
                    <label key={option} className={`${styles.recommendOption} ${form.recommend === option ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="recommend"
                        value={option}
                        checked={form.recommend === option}
                        onChange={() => setForm((f) => ({ ...f, recommend: option }))}
                        className={styles.radioHidden}
                        id={`recommend-${option.toLowerCase()}`}
                      />
                      <span>{option === 'YES' ? '👍 Yes' : option === 'MAYBE' ? '🤔 Maybe' : '👎 No'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className={styles.errorBox}>⚠️ {error}</div>}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
                id="submit-feedback-btn"
                style={{ justifyContent: 'center' }}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
