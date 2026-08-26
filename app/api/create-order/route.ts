// app/api/create-order/route.ts
// SERVER-SIDE: Creates a Razorpay order and saves a pending order to Firestore
// The Razorpay secret key is NEVER exposed to the frontend

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';
import { BOOK } from '@/lib/constants';
import { calculateShipping } from '@/lib/shipping';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const {
      quantity,
      bookPrice,
      deliveryCharge,
      totalAmount,
      customerName,
      mobile,
      email,
      address,
    } = body;

    // Basic server-side validation
    if (!quantity || !totalAmount || !customerName || !mobile || !email || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Verify price on server side (don't trust frontend price)
    const BOOK_PRICE = BOOK.price;
    const expectedDelivery = calculateShipping(address.state, quantity);
    const expectedTotal = BOOK_PRICE * quantity + expectedDelivery;

    if (totalAmount !== expectedTotal) {
      return NextResponse.json({ error: 'Price mismatch. Please refresh and try again.' }, { status: 400 });
    }

    // Check stock
    const bookRef = adminDb.collection('book').doc('the-ride');
    const bookSnap = await bookRef.get();
    if (bookSnap.exists) {
      const bookData = bookSnap.data()!;
      if (bookData.availableStock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock. Please reduce quantity.' }, { status: 400 });
      }
    }

    // Generate order number using atomic counter
    const counterRef = adminDb.collection('counters').doc('orderCounter');
    const orderNumber = await adminDb.runTransaction(async (transaction: Transaction) => {
      const counterSnap = await transaction.get(counterRef);
      const currentCount = counterSnap.exists ? counterSnap.data()!.count : 0;
      const newCount = currentCount + 1;
      transaction.set(counterRef, { count: newCount }, { merge: true });
      const year = new Date().getFullYear();
      return `TR-${year}-${String(newCount).padStart(6, '0')}`;
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: expectedTotal * 100, // paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customerName,
        mobile,
        email,
      },
    });

    // Save pending order to Firestore
    const orderRef = adminDb.collection('orders').doc();
    const now = Date.now();
    await orderRef.set({
      orderNumber,
      customerName,
      mobile,
      email,
      address,
      quantity,
      bookPrice: BOOK_PRICE,
      deliveryCharge: expectedDelivery,
      totalAmount: expectedTotal,
      paymentStatus: 'PENDING',
      orderStatus: 'ORDER_PLACED',
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: null,
      orderDate: new Date().toISOString(),
      estimatedDelivery: null,
      courierName: null,
      trackingNumber: null,
      trackingUrl: null,
      createdAt: now,
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      firestoreOrderId: orderRef.id,
      orderNumber,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
