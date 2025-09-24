import fetch from 'cross-fetch';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

// Inicializa admin (apenas uma vez)
try { admin.app(); } catch { admin.initializeApp(); }

// Placeholder: função para servir Next.js (poderia futuramente usar next-on-functions ou similar)
export const nextServer = functions.https.onRequest(async (req, res) => {
  res.status(200).send('Next.js server placeholder - configure build integration.');
});
