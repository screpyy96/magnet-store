// Acest fișier ajută la gestionarea cererilor cross-origin pentru Stripe
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Nu face nimic special, lasă browser-ul să gestioneze cererea
}); 