// src/fcmToken.tsx
import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { registerFcmServiceWorker } from './swRegister';

// ⚙️ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDDChyDYjNDSfhxpUhAEZhDL0EzbJuMZVs",
  authDomain: "mitratender-930dd.firebaseapp.com",
  projectId: "mitratender-930dd",
  messagingSenderId: "857516011204",
  appId: "1:857516011204:web:3ebf66f4df3f62f9a36391",
};

// 🔑 Your VAPID key from Firebase console → Cloud Messaging → Web Push certificates
const VAPID_KEY = "BCIeCNL2zQe19cy0VP60pq10aFJlfPje1a0pMg9E5aTefLXp85XLDLIvw2YfzBeaoZCpoe09zsazCFfERRU5p0s";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export default function FcmToken() {
  useEffect(() => {
    (async () => {
      try {
        // Require HTTPS or localhost
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          throw new Error('FCM requires HTTPS or localhost');
        }

        // Ask user for permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('Notification permission denied');

        // Register service worker
        const swReg = await registerFcmServiceWorker();

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!token) throw new Error('No FCM token returned');
        console.log('🎯 FCM Token:', token);

        // TODO: send this token to your backend API
      } catch (err) {
        console.error('❌ FCM token error:', err);
      }
    })();

    // Listen for foreground messages
    const unsub = onMessage(messaging, (payload) => {
      console.log('🔔 Foreground message:', payload);
      alert(payload.notification?.title || 'New Notification!');
    });

    return () => unsub();
  }, []);

  return null;
}
