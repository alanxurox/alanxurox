// Authentication lifecycle functions
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from './email.service';
import { UserSettings } from './types';

/**
 * Triggered when a new user is created
 * Creates user document in Firestore and sends welcome email
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;
  const email = user.email;

  if (!email) {
    console.warn(`⚠️  User ${userId} created without email`);
    return;
  }

  console.log(`👤 New user created: ${userId} (${email})`);

  const db = admin.firestore();

  // Default user settings
  const defaultSettings: UserSettings = {
    reminderTime: '09:00',
    alertThreshold: 2, // days
    vacationMode: false,
    personalMessage: '',
    notificationsEnabled: true,
  };

  // Create user document in Firestore
  const userData = {
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isPaid: false, // User needs to purchase
    lastCheckIn: null,
    streak: 0,
    settings: defaultSettings,
  };

  try {
    await db.collection('users').doc(userId).set(userData);
    console.log(`✅ User document created for ${userId}`);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, email.split('@')[0]).catch((error) => {
      console.error(`❌ Failed to send welcome email to ${email}:`, error);
      // Don't throw - welcome email is optional
    });

    return {
      success: true,
      userId,
    };
  } catch (error) {
    console.error(`❌ Error creating user document for ${userId}:`, error);
    throw error;
  }
});

/**
 * Triggered when a user is deleted
 * Cleans up all user data (GDPR compliance)
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const email = user.email;

  console.log(`🗑️  User deleted: ${userId} (${email})`);

  const db = admin.firestore();
  const batch = db.batch();

  try {
    // Delete user document
    batch.delete(db.collection('users').doc(userId));

    // Delete all emergency contacts
    const contactsSnapshot = await db
      .collection('contacts')
      .where('userId', '==', userId)
      .get();

    contactsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    console.log(`   Deleting ${contactsSnapshot.size} emergency contacts`);

    // Delete all check-ins
    const checkInsSnapshot = await db
      .collection('checkins')
      .where('userId', '==', userId)
      .get();

    checkInsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    console.log(`   Deleting ${checkInsSnapshot.size} check-ins`);

    // Delete all alerts
    const alertsSnapshot = await db
      .collection('alerts')
      .where('userId', '==', userId)
      .get();

    alertsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    console.log(`   Deleting ${alertsSnapshot.size} alerts`);

    // Commit all deletions
    await batch.commit();

    console.log(`✅ All data deleted for user ${userId}`);

    return {
      success: true,
      userId,
      itemsDeleted: {
        contacts: contactsSnapshot.size,
        checkIns: checkInsSnapshot.size,
        alerts: alertsSnapshot.size,
      },
    };
  } catch (error) {
    console.error(`❌ Error deleting data for user ${userId}:`, error);
    throw error;
  }
});

/**
 * Manually delete user data (callable function)
 * For users who want to delete their account
 */
export const deleteMyAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to delete account'
    );
  }

  const userId = context.auth.uid;
  const confirmation = data.confirmation; // User must type "DELETE" to confirm

  if (confirmation !== 'DELETE') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Must provide confirmation: "DELETE"'
    );
  }

  console.log(`🗑️  User ${userId} requested account deletion`);

  try {
    // Delete from Firebase Auth (triggers onUserDeleted)
    await admin.auth().deleteUser(userId);

    console.log(`✅ User ${userId} deleted successfully`);

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    console.error(`❌ Error deleting user ${userId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete account',
      error
    );
  }
});

/**
 * Export user data (GDPR compliance)
 */
export const exportMyData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to export data'
    );
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  console.log(`📦 User ${userId} requested data export`);

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Get emergency contacts
    const contactsSnapshot = await db
      .collection('contacts')
      .where('userId', '==', userId)
      .get();

    const contacts = contactsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }));

    // Get check-ins (last 100)
    const checkInsSnapshot = await db
      .collection('checkins')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const checkIns = checkInsSnapshot.docs.map((doc) => ({
      id: doc.id,
      timestamp: doc.data().timestamp.toDate().toISOString(),
      method: doc.data().method,
    }));

    // Get alerts
    const alertsSnapshot = await db
      .collection('alerts')
      .where('userId', '==', userId)
      .orderBy('sentAt', 'desc')
      .get();

    const alerts = alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      sentAt: doc.data().sentAt.toDate().toISOString(),
      reason: doc.data().reason,
      resolved: doc.data().resolved,
      resolvedAt: doc.data().resolvedAt?.toDate()?.toISOString() || null,
    }));

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      user: userData
        ? {
            ...userData,
            createdAt: userData.createdAt?.toDate()?.toISOString(),
            lastCheckIn: userData.lastCheckIn?.toDate()?.toISOString(),
          }
        : null,
      contacts,
      checkIns,
      alerts,
    };

    console.log(`✅ Data export prepared for user ${userId}`);

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error(`❌ Error exporting data for user ${userId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to export data',
      error
    );
  }
});
