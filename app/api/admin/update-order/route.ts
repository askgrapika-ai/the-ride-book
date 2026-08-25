// app/api/admin/update-order/route.ts
// Admin-only: Update order status, courier info, estimated delivery

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    // Check if user is in the admin collection
    const adminDoc = await adminDb.collection('admins').doc(decoded.uid).get();
    return adminDoc.exists;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, updates } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const allowedFields = [
      'orderStatus',
      'estimatedDelivery',
      'courierName',
      'trackingNumber',
      'trackingUrl',
    ];

    const safeUpdates: Record<string, string> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    safeUpdates.updatedAt = new Date().toISOString();

    await adminDb.collection('orders').doc(orderId).update(safeUpdates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
