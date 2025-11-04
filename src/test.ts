import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

export const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "yourproj.firebaseapp.com",
  projectId: "yourproj",
  storageBucket: "yourproj.appspot.com",
  messagingSenderId: "410726910206",
  appId: "YOUR_APP_ID",
});

export const getMessagingIfSupported = async () =>
  (await isSupported()) ? getMessaging(app) : null;
