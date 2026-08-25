import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, adminAuth } from './lib/firebase-admin';

async function checkAdmins() {
  console.log('--- Checking Firebase Auth Users ---');
  let authUid = null;
  try {
    const listUsersResult = await adminAuth.listUsers();
    listUsersResult.users.forEach((userRecord) => {
      console.log(`User: ${userRecord.email}`);
      console.log(`UID: ${userRecord.uid}`);
      if (userRecord.email === 'askgrapika@gmail.com') {
        authUid = userRecord.uid;
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }

  console.log('\n--- Checking Firestore admins collection ---');
  try {
    const adminsSnapshot = await adminDb.collection('admins').get();
    if (adminsSnapshot.empty) {
      console.log('No documents found in the "admins" collection!');
    } else {
      adminsSnapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`);
        console.log(`Document Data:`, doc.data());
      });
    }
  } catch (error) {
    console.error('Error reading admins collection:', error);
  }

  if (authUid) {
    console.log(`\n--- Verification ---`);
    console.log(`Checking if document ID "${authUid}" exists in admins collection...`);
    const doc = await adminDb.collection('admins').doc(authUid).get();
    if (doc.exists) {
      console.log('SUCCESS: Admin UID is correctly set in Firestore!');
    } else {
      console.log('FAILED: The document ID in Firestore does NOT match the Auth UID.');
      console.log('Fixing it automatically...');
      await adminDb.collection('admins').doc(authUid).set({
        email: 'askgrapika@gmail.com',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      });
      console.log('SUCCESS: I have automatically created the correct admin document for you!');
    }
  }
}

checkAdmins().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
