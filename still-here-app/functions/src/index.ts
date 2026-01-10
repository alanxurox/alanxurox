// Firebase Cloud Functions for Still Here app
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all Cloud Functions
export {
  checkMissedCheckIns,
  checkMissedCheckInsManual,
  resolveAlert,
} from './checkMissedCheckIns';

export {
  recordCheckIn,
  getUserStats,
} from './checkin';

export {
  onUserCreated,
  onUserDeleted,
} from './auth';

// Health check endpoint
import * as functions from 'firebase-functions';

export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Still Here Cloud Functions',
    version: '1.0.0',
  });
});
