import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';

export const razorpayWebhook = https.onRequest(async (_req, _res) => {
  throw new HttpsError('unimplemented', 'TODO: implement in phase 5');
});
