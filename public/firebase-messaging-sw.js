// public/firebase-messaging-sw.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-sw.js';

firebase.initializeApp({
  apiKey: "AIzaSyDDChyDYjNDSfhxpUhAEZhDL0EzbJuMZVs",
  authDomain: "mitratender-930dd.firebaseapp.com",
  projectId: "mitratender-930dd",
  storageBucket: "mitratender-930dd.firebasestorage.app",
  messagingSenderId: "857516011204",
  appId: "1:857516011204:web:3ebf66f4df3f62f9a36391",
  measurementId: "G-PZVW5J462T"
});

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background notifications
onBackgroundMessage(messaging, (payload) => {
  console.log('📩 Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo192.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});