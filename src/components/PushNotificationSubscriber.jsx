'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationSubscriber() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Înregistrăm service worker-ul
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          setSwRegistration(registration);
          
          // Verificăm dacă există deja un abonament activ
          return registration.pushManager.getSubscription();
        })
        .then(subscription => {
          setIsSubscribed(!!subscription);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  // Funcție pentru abonare
  const subscribeUser = async () => {
    if (!swRegistration || !user) return;
    
    setIsLoading(true);
    
    try {
      // Obținem cheia publică de la server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not found');
      }
      
      // Convertim cheia în ArrayBuffer pentru API-ul PushManager
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Obținem abonamentul de la browser
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      // Trimitem abonamentul la server
      const isAdmin = user.role === 'admin'; // Sau orice logică determină un admin
      const endpoint = isAdmin ? '/api/notifications/subscribe-admin' : '/api/notifications/subscribe';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
      
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      alert('Nu am putut activa notificările push. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție pentru dezabonare
  const unsubscribeUser = async () => {
    if (!swRegistration) return;
    
    setIsLoading(true);
    
    try {
      // Obținem abonamentul curent
      const subscription = await swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Dezabonăm de la browser
        await subscription.unsubscribe();
        
        // Ștergem abonamentul din baza de date
        const isAdmin = user.role === 'admin';
        const endpoint = isAdmin ? '/api/notifications/unsubscribe-admin' : '/api/notifications/unsubscribe';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            endpoint: subscription.endpoint
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove subscription from server');
        }
        
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      alert('Nu am putut dezactiva notificările. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție utilitară pentru convertirea cheii BASE64
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Dacă Push API nu este suportat
  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    return (
      <div className="text-gray-500 text-sm py-2">
        <BellOff className="h-4 w-4 inline mr-1" />
        Browserul tău nu suportă notificări push
      </div>
    );
  }

  // Dacă nu există un utilizator autentificat
  if (!user) {
    return null;
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribeUser : subscribeUser}
      disabled={isLoading}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        isSubscribed 
          ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        isSubscribed ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />
      )}
      {isSubscribed ? 'Dezactivează notificările' : 'Activează notificările'}
    </button>
  );
} 