// Asigură-te că folosești aceleași chei VAPID peste tot
export const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
}; 