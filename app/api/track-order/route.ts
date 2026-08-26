// app/api/track-order/route.ts
// Public endpoint for customers to track their order by order number

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim().toUpperCase();

    if (!orderNumber || !orderNumber.startsWith('TR-')) {
      return NextResponse.json({ error: 'Please enter a valid order number (e.g., TR-2026-000001)' }, { status: 400 });
    }

    // Query Firestore for the order
    const snapshot = await getAdminDb()
      .collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Order not found. Please check your order number.' }, { status: 404 });
    }

    const orderData = snapshot.docs[0].data();

    // Return only customer-safe fields (no internal IDs)
    return NextResponse.json({
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      address: orderData.address,
      quantity: orderData.quantity,
      totalAmount: orderData.totalAmount,
      paymentStatus: orderData.paymentStatus,
      orderStatus: orderData.orderStatus,
      orderDate: orderData.orderDate,
      estimatedDelivery: orderData.estimatedDelivery,
      courierName: orderData.courierName,
      trackingNumber: orderData.trackingNumber,
      trackingUrl: orderData.trackingUrl,
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order. Please try again.' }, { status: 500 });
  }
}
