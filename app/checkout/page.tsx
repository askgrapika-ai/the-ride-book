'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './checkout.module.css';
import { CheckoutForm, CartState } from '@/lib/types';
import { BOOK } from '@/lib/constants';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const initialForm: CheckoutForm = {
  customerName: '',
  mobile: '',
  email: '',
  house: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

function validate(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.customerName.trim()) errors.customerName = 'Full name is required';
  if (!/^[6-9]\d{9}$/.test(form.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.house.trim()) errors.house = 'House/Door number is required';
  if (!form.street.trim()) errors.street = 'Street/Area is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state) errors.state = 'Please select a state';
  if (!/^\d{6}$/.test(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderState, setOrderState] = useState<CartState | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutForm, boolean>>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem('orderState');
    if (!stored) {
      router.replace('/order');
      return;
    }
    setOrderState(JSON.parse(stored));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof CheckoutForm]) {
      setErrors((prev) => ({ ...prev, [name]: validate({ ...form, [name]: value })[name as keyof CheckoutForm] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(form)[name as keyof CheckoutForm] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Calculate dynamic delivery
    const delivery = form.state === 'Telangana' ? BOOK.deliveryChargeTelangana : BOOK.deliveryChargeOther;
    const finalTotal = orderState.bookPrice * orderState.quantity + delivery;
    const updatedOrderState = { ...orderState, deliveryCharge: delivery, total: finalTotal, totalAmount: finalTotal };

    // Save checkout data
    sessionStorage.setItem('orderState', JSON.stringify(updatedOrderState));
    sessionStorage.setItem('checkoutForm', JSON.stringify(form));
    router.push('/payment');
  };

  if (!orderState) return null;

  // Live calculation for UI
  const deliveryCharge = form.state ? (form.state === 'Telangana' ? BOOK.deliveryChargeTelangana : BOOK.deliveryChargeOther) : 0;
  const currentTotal = orderState.bookPrice * orderState.quantity + deliveryCharge;

  const field = (
    name: keyof CheckoutForm,
    label: string,
    placeholder: string,
    type = 'text',
    required = true
  ) => (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-input ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete={name === 'email' ? 'email' : name === 'mobile' ? 'tel' : 'on'}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

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
          <div className="progress-step active">
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
          <form className={styles.formSection} onSubmit={handleSubmit} noValidate>
            {/* Customer Info */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 className={styles.sectionTitle}>Your Information</h2>
              <div className={styles.formStack}>
                {field('customerName', 'Full Name', 'Enter your full name')}
                <div className="form-grid">
                  {field('mobile', 'Mobile Number', '10-digit mobile number', 'tel')}
                  {field('email', 'Email Address', 'your@email.com', 'email')}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card">
              <h2 className={styles.sectionTitle}>Delivery Address</h2>
              <div className={styles.formStack}>
                {field('house', 'House / Door Number', 'e.g., 12-3-456')}
                {field('street', 'Street / Area', 'Street name or area/locality')}
                <div className="form-grid">
                  {field('city', 'City', 'e.g., Amalapuram')}
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      State <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      className={`form-input ${errors.state ? 'error' : ''}`}
                      value={form.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>
                </div>
                {field('pincode', 'Pincode', '6-digit pincode')}
                <div className="form-group">
                  <label htmlFor="landmark" className="form-label">Landmark (Optional)</label>
                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Near Bus Stand"
                    value={form.landmark}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              id="continue-to-payment-btn"
              style={{ justifyContent: 'center', marginTop: '1rem' }}
            >
              Continue to Payment →
            </button>

            <Link href="/order" className={`btn btn-ghost ${styles.backBtn}`}>
              ← Back to Order
            </Link>
          </form>

          {/* Order Summary */}
          <div className={styles.summarySection}>
            <div className="order-summary">
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              <div className={styles.summaryBook}>
                <div style={{ width: '60px', height: '85px', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src="/images/book%20.jpeg" alt="The Ride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>The Ride</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Qty: {orderState.quantity}</div>
                </div>
              </div>
              <div className="order-summary-row">
                <span>Book × {orderState.quantity}</span>
                <span>₹{orderState.bookPrice * orderState.quantity}</span>
              </div>
              <div className="order-summary-row">
                <span>Delivery</span>
                <span style={{ color: 'var(--color-gold)' }}>
                  {form.state ? `₹${deliveryCharge}` : <span style={{fontSize: '0.875rem'}}>Select State</span>}
                </span>
              </div>
              <div className="order-summary-row total">
                <span>Total</span>
                <span>₹{currentTotal}</span>
              </div>
            </div>

            <div className={styles.secureNote}>
              <span>🔒</span>
              <span>Your information is secure and will only be used for delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
