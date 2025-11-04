// src/swRegister.ts
export async function registerFcmServiceWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported in this browser');

  // Register the service worker at the site root
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
  await navigator.serviceWorker.ready; // wait until it's active
  console.log('✅ Service Worker registered:', registration);
  return registration;
}
