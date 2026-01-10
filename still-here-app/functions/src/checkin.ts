// Check-in related Cloud Functions
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CheckInMethod } from './types';
import { resolveAlert } from './checkMissedCheckIns';

/**
 * Record a check-in for a user
 * Called from the mobile app
 */
export const recordCheckIn = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to check in'
    );
  }

  const userId = context.auth.uid;
  const method = (data.method as CheckInMethod) || CheckInMethod.APP;
  const db = admin.firestore();

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Create check-in record
    const checkInData = {
      userId,
      timestamp: now,
      method,
    };

    await db.collection('checkins').add(checkInData);

    // Update user's last check-in and streak
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const lastCheckIn = userData?.lastCheckIn?.toDate();
    const currentStreak = userData?.streak || 0;

    // Calculate new streak
    let newStreak = 1;
    if (lastCheckIn) {
      const daysSinceLastCheckIn = Math.floor(
        (Date.now() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCheckIn === 1) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1;
      } else if (daysSinceLastCheckIn === 0) {
        // Same day - keep streak
        newStreak = currentStreak;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }

    // Update user document
    await userRef.update({
      lastCheckIn: now,
      streak: newStreak,
    });

    // Resolve any pending alerts (check-in after missing days)
    if (lastCheckIn) {
      const daysSinceLastCheckIn = Math.floor(
        (Date.now() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCheckIn >= 2) {
        // User checked in after missing days - resolve alerts
        await resolveAlert({}, context);
        console.log(`✅ Resolved alerts for user ${userId} after late check-in`);
      }
    }

    console.log(`✅ Check-in recorded for user ${userId}, streak: ${newStreak}`);

    return {
      success: true,
      streak: newStreak,
      timestamp: new Date().toISOString(),
      message: 'Check-in recorded successfully',
    };
  } catch (error) {
    console.error(`❌ Error recording check-in for user ${userId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to record check-in',
      error
    );
  }
});

/**
 * Get user stats (streak, total check-ins, etc.)
 */
export const getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();

    // Get total check-ins count
    const checkInsSnapshot = await db
      .collection('checkins')
      .where('userId', '==', userId)
      .count()
      .get();

    const totalCheckIns = checkInsSnapshot.data().count;

    // Get alerts sent count
    const alertsSnapshot = await db
      .collection('alerts')
      .where('userId', '==', userId)
      .count()
      .get();

    const alertsSent = alertsSnapshot.data().count;

    // Calculate days since first check-in
    const firstCheckInSnapshot = await db
      .collection('checkins')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'asc')
      .limit(1)
      .get();

    let daysSinceStart = 0;
    if (!firstCheckInSnapshot.empty) {
      const firstCheckIn = firstCheckInSnapshot.docs[0].data().timestamp.toDate();
      daysSinceStart = Math.floor(
        (Date.now() - firstCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const stats = {
      userId,
      streak: userData?.streak || 0,
      lastCheckIn: userData?.lastCheckIn?.toDate()?.toISOString() || null,
      totalCheckIns,
      alertsSent,
      daysSinceStart,
      createdAt: userData?.createdAt?.toDate()?.toISOString() || null,
      isPaid: userData?.isPaid || false,
      vacationMode: userData?.settings?.vacationMode || false,
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error(`❌ Error getting stats for user ${userId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get user stats',
      error
    );
  }
});

/**
 * Get check-in history for a user
 */
export const getCheckInHistory = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;
    const limit = data.limit || 30; // Default: last 30 check-ins
    const db = admin.firestore();

    try {
      const checkInsSnapshot = await db
        .collection('checkins')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const checkIns = checkInsSnapshot.docs.map((doc) => ({
        id: doc.id,
        timestamp: doc.data().timestamp.toDate().toISOString(),
        method: doc.data().method,
      }));

      return {
        success: true,
        checkIns,
        count: checkIns.length,
      };
    } catch (error) {
      console.error(`❌ Error getting check-in history for user ${userId}:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get check-in history',
        error
      );
    }
  }
);
