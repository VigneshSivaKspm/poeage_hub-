import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, adminMessaging, FieldValue } from '../shared/admin.js';

interface SendNotificationInput {
  userId: string;
  title: string;
  body: string;
  type?: 'order' | 'delivery' | 'system' | 'promotion';
  link?: string;
}

export const sendNotification = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;

  const { userId, title, body, type = 'system', link } = request.data as SendNotificationInput;
  if (!userId || !title || !body) {
    throw new HttpsError('invalid-argument', 'userId, title, and body are required.');
  }

  // 1. Save in-app notification
  const notifRef = adminDb.collection('notifications').doc();
  await notifRef.set({
    id: notifRef.id,
    userId,
    senderId: uid,
    title,
    body,
    type,
    link: link || null,
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 2. Attempt FCM push if user has fcmToken
  try {
    const userSnap = await adminDb.collection('users').doc(userId).get();
    const token = userSnap.data()?.['fcmToken'];
    if (token) {
      await adminMessaging.send({
        token,
        notification: { title, body },
        data: { link: link || '', type },
      });
    }
  } catch (fcmErr) {
    // Non-fatal if device token is expired or push fails
    console.warn('FCM delivery note:', fcmErr);
  }

  return { success: true, notificationId: notifRef.id };
});
