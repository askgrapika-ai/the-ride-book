// lib/firebase-admin.ts
// Server-side Firebase Admin SDK – used only in API routes
// NEVER import this in client components

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

function getFirebaseAdminApp() {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  try {
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    // Fix Vercel formatting issues (quotes and escaped newlines)
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
    return app;
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
    throw error;
  }
}

// We wrap the db/auth exports in getters so they don't crash on import
export const getAdminDb = () => getFirestore(getFirebaseAdminApp());
export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
export default getFirebaseAdminApp;
