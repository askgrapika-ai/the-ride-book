// app/api/verify-payment/route.ts
// SERVER-SIDE: Verifies Razorpay HMAC signature and marks order as PAID
// CRITICAL: Only this endpoint can mark an order as PAID — never trust frontend

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      firestoreOrderId,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !firestoreOrderId) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 });
    }

    // Verify HMAC signature using the secret key (server-only)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature mismatch!');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Fetch the order document
    const orderRef = adminDb.collection('orders').doc(firestoreOrderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderSnap.data()!;

    // Prevent double-processing
    if (orderData.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, orderNumber: orderData.orderNumber });
    }

    // Update order as PAID in a transaction (also decrement stock)
    const bookRef = adminDb.collection('book').doc('the-ride');

    await adminDb.runTransaction(async (transaction: Transaction) => {
      transaction.update(orderRef, {
        paymentStatus: 'PAID',
        orderStatus: 'PAYMENT_CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: Date.now(),
      });

      // Decrement available stock, use set with merge in case the document hasn't been initialized by admin yet
      transaction.set(bookRef, {
        availableStock: FieldValue.increment(-orderData.quantity),
        soldCount: FieldValue.increment(orderData.quantity),
      }, { merge: true });
    });

    return NextResponse.json({ success: true, orderNumber: orderData.orderNumber });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
