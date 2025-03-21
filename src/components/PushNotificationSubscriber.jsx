'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationSubscriber() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificăm suportul pentru notificări 
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      setIsSupported(false);
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        setRegistration(reg);
        
        // Verifică dacă există deja un abonament
        const existingSub = await reg.pushManager.getSubscription();
        
        if (existingSub) {
          setSubscription(existingSub);
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  const subscribeToNotifications = async () => {
    if (!registration || !user) return;
    
    try {
      setLoading(true);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      });
      
      setSubscription(subscription);
      
      // Trimite abonamentul la server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subscription');
      }
      
      setIsSubscribed(true);
      console.log('Successfully subscribed to push notifications');
      
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return;
    
    try {
      setLoading(true);
      
      // Anulează abonamentul local
      await subscription.unsubscribe();
      
      // Informează serverul
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unsubscribe');
      }
      
      setSubscription(null);
      setIsSubscribed(false);
      console.log('Successfully unsubscribed from push notifications');
      
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utilitar pentru conversie
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  if (!isSupported) {
    return (
      <div className="py-3 px-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Push Notifications</h3>
      
      <p className="text-sm text-gray-500 mb-4">
        {isSubscribed 
          ? "You're subscribed to push notifications for new order updates." 
          : "Subscribe to receive push notifications for new order updates."}
      </p>
      
      <button
        onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
        disabled={loading}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isSubscribed 
            ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50" 
            : "border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : isSubscribed ? (
          'Unsubscribe'
        ) : (
          'Subscribe to Notifications'
        )}
      </button>
    </div>
  );
} 