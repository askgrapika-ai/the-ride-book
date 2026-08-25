import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const email = 'askgrapika@gmail.com';
    
    // 1. Get the user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    const uid = userRecord.uid;

    // 2. Write exactly that UID into the admins collection
    await adminDb.collection('admins').doc(uid).set({
      email: email,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully set admin permissions for ${email}`,
      uid: uid
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
