import { config } from 'dotenv';
config({ path: '.env.local' });
import { getAdminDb } from './lib/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

async function cleanDatabase() {
  const adminDb = getAdminDb();
  console.log('--- Starting Database Cleanup ---');

  // 1. Delete all orders
  try {
    const ordersSnapshot = await adminDb.collection('orders').get();
    if (ordersSnapshot.empty) {
      console.log('No orders to delete.');
    } else {
      const batch = adminDb.batch();
      ordersSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Successfully deleted ${ordersSnapshot.size} test orders.`);
    }
  } catch (error) {
    console.error('Error deleting orders:', error);
  }

  // 2. Reset Inventory
  try {
    const bookRef = adminDb.collection('book').doc('the-ride');
    const bookSnap = await bookRef.get();

    if (bookSnap.exists) {
      const data = bookSnap.data();
      const totalStock = data?.totalStock || 300;

      await bookRef.update({
        availableStock: totalStock,
        soldCount: 0
      });
      console.log(`Successfully reset inventory. Available stock is now ${totalStock} and sold copies is 0.`);
    } else {
      console.log('Book inventory document not found. Nothing to reset.');
    }
  } catch (error) {
    console.error('Error resetting inventory:', error);
  }

  console.log('--- Cleanup Complete ---');
}

cleanDatabase().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
