// Adaugă la începutul fișierului:
const SW_VERSION = '1.0.2'; // Incrementează această valoare pentru a forța actualizarea

console.log(`[Service Worker] Versiune ${SW_VERSION} se încarcă...`);

// Service Worker pentru gestionarea notificărilor push
console.log('[Service Worker] Script loading...');

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalat');
  self.skipWaiting(); // Forțează activarea imediată
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activat');
  return self.clients.claim(); // Preia controlul tuturor clienților
});

// Utilitar pentru a depana notificările
function logNotificationEvent(type, event) {
  console.log(`[Service Worker] ${type}:`, 
    event.notification ? 
    {
      title: event.notification.title,
      body: event.notification.body,
      tag: event.notification.tag,
      data: event.notification.data
    } : 
    'No notification data'
  );
}

// Gestionare notificări push - îmbunătățirea formatului pentru a suporta și notificările pentru clienți
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificare push primită');

  try {
    const data = event.data.json();
    console.log('[Service Worker] Payload notificare:', data);

    // Titlul și textul implicit depind de tipul notificării
    let defaultTitle = 'Notificare nouă';
    let defaultBody = 'Ai o notificare importantă';
    
    // Verifică dacă payload-ul indică tipul de utilizator (admin sau client)
    if (data.userType === 'admin') {
      defaultTitle = 'Comandă nouă';
      defaultBody = 'Ai primit o comandă nouă!';
    } else if (data.userType === 'client') {
      defaultTitle = 'Actualizare comandă';
      defaultBody = 'Comanda ta a fost actualizată';
    }

    const title = data.title || defaultTitle;
    const options = {
      body: data.body || defaultBody,
      icon: '/logo-mark.svg',
      badge: '/badge.png',
      tag: data.tag || 'notification', // Identificator pentru notificare
      data: {
        url: data.url || '/', // URL pentru a naviga când se face clic pe notificare
        userType: data.userType,
        orderId: data.orderId,
        data: data.data || {}
      },
      requireInteraction: true, // Notificarea rămâne vizibilă până când utilizatorul interacționează cu ea
      vibrate: [100, 50, 100], // Pattern de vibrație pentru dispozitive mobile
    };

    // Afișează notificarea
    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => console.log('[Service Worker] Notificare afișată cu succes'))
        .catch(error => console.error('[Service Worker] Eroare la afișarea notificării:', error))
    );
  } catch (error) {
    console.error('[Service Worker] Eroare generală în handler-ul de push:', error);
  }
});

// Modifică evenimentul notificationclick pentru a gestiona și notificările pentru clienți
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click pe notificare', event.notification.tag);
  event.notification.close(); // Închide notificarea

  const data = event.notification.data || {};
  
  let url = '/'; // URL implicit este pagina principală
  if (data.url) {
    // Folosește URL-ul specificat în notificare
    url = data.url;
  } else if (data.orderId) {
    // Pentru notificări specifice comenzilor
    if (data.userType === 'admin') {
      url = `/admin/orders/${data.orderId}`;
    } else {
      // Pentru clienți, redirecționează către pagina contului sau detaliile comenzii
      url = `/account/orders/${data.orderId}`;
    }
  } else if (data.userType === 'admin') {
    // Dacă e pentru admin și nu are URL specificat, mergi la lista de comenzi
    url = '/admin/orders';
  } else {
    // Dacă e pentru client și nu are URL specificat, mergi la pagina contului
    url = '/account';
  }

  console.log('[Service Worker] Navigare la:', url);

  // Deschide fereastra browser-ului și navighează
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsList) => {
        // Verifică dacă există deja o fereastră deschisă
        for (const client of clientsList) {
          if ('focus' in client) {
            console.log('[Service Worker] Focusez fereastra existentă');
            return client.focus().then(() => {
              if (client.url !== url) {
                return client.navigate(url);
              }
            });
          }
        }
        // Deschide o fereastră nouă
        console.log('[Service Worker] Deschid fereastră nouă');
        return self.clients.openWindow(url);
      })
  );
});

// Ascultă când notificarea este închisă fără interacțiune
self.addEventListener('notificationclose', (event) => {
  logNotificationEvent('Notificare închisă', event);
});

// Debugging
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mesaj primit:', event.data);
  if (event.data && event.data.type === 'PING') {
    event.source.postMessage({
      type: 'PONG',
      timestamp: new Date().toISOString()
    });
  }
});

console.log('[Service Worker] Script încărcat complet.'); 
