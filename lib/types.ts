// lib/types.ts
// TypeScript types for the entire application

export interface DeliveryAddress {
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string; // Firestore document ID
  orderNumber: string; // TR-2026-000001
  customerName: string;
  mobile: string;
  email: string;
  address: DeliveryAddress;
  quantity: number;
  bookPrice: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  orderStatus:
    | 'ORDER_PLACED'
    | 'PAYMENT_CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderDate: string; // ISO string
  estimatedDelivery?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: number; // Unix timestamp
}

export interface Feedback {
  id: string;
  orderId?: string;
  customerName?: string;
  rating: number; // 1–5
  feedback: string;
  recommend: 'YES' | 'MAYBE' | 'NO';
  createdAt: number;
  approved: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  deliveryCharge: number;
  coverImage?: string;
  pages: number;
  language: string;
  publisher: string;
  isbn?: string;
  totalStock: number;
  availableStock: number;
  soldCount: number;
}

export interface CartState {
  quantity: number;
  bookPrice: number;
  deliveryCharge: number;
  totalAmount: number;
  total: number;
}

export interface CheckoutForm {
  customerName: string;
  mobile: string;
  email: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
