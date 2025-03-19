// Ascultă pentru notificări push
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Ai o notificare nouă',
      icon: data.icon || '/logo192.png',
      badge: '/badge.png',
      data: {
        url: data.url || '/'
      },
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Notificare', options)
    );
  } catch (e) {
    console.error('Error showing notification:', e);
  }
});

// Deschide pagina când utilizatorul apasă pe notificare
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // Verifică dacă există deja o fereastră deschisă și redirecționează către URL
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(url) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Dacă nu există nicio fereastră deschisă, deschide una nouă
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
}); 