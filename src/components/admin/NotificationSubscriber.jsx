import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const NotificationSubscriber = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then(reg => {
          setSwRegistration(reg);
          return reg.pushManager.getSubscription();
        })
        .then(subscription => {
          setIsSubscribed(!!subscription);
          setDebugInfo(prev => ({ ...prev, subscriptionExists: !!subscription }));
        })
        .catch(error => {
          console.error('Error initializing notification service:', error);
          setDebugInfo(prev => ({ ...prev, initError: error.message }));
        });
    } else {
      console.log('Push notifications are not supported by this browser');
      setDebugInfo(prev => ({ ...prev, supported: false }));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          console.log('Service Worker successfully registered:', reg);
          setSwRegistration(reg);
        })
        .catch(err => console.error('Error registering Service Worker:', err));
    }
  }, []);

  const subscribeUser = async () => {
    if (!swRegistration) {
      toast.error('Service Worker not available');
      return;
    }

    try {
      setIsSubscribing(true);
      setDebugInfo(prev => ({ ...prev, subscribing: true }));

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('VAPID public key is not configured');
      }

      setDebugInfo(prev => ({ ...prev, publicKeyExists: !!publicKey }));

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      // Log more detailed information
      console.log('Subscribing to push with application server key:', publicKey.substring(0, 10) + '...');
      
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      console.log('Subscription created successfully:', subscription);
      
      // Log a more detailed version of the subscription
      const subscriptionJSON = subscription.toJSON();
      console.log('Subscription JSON:', subscriptionJSON);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        subscriptionCreated: true,
        endpoint: subscription.endpoint.substring(0, 30) + '...',
        subscriptionDetails: {
          endpoint: subscription.endpoint,
          keys: subscriptionJSON.keys
        }
      }));

      await updateSubscriptionOnServer(subscription);
      setIsSubscribed(true);
      toast.success('You have successfully subscribed to notifications for new orders!');
    } catch (error) {
      console.error('Error subscribing:', error);
      setDebugInfo(prev => ({ ...prev, subscribeError: error.message }));
      toast.error(`Error subscribing: ${error.message}`);
    } finally {
      setIsSubscribing(false);
      setDebugInfo(prev => ({ ...prev, subscribing: false }));
    }
  };

  const unsubscribeUser = async () => {
    if (!swRegistration) return;

    try {
      setIsSubscribing(true);
      const subscription = await swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      setIsSubscribed(false);
      toast.success('You have unsubscribed from notifications');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error(`Error unsubscribing: ${error.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const updateSubscriptionOnServer = async (subscription) => {
    try {
      // Convert the PushSubscription to a plain object if needed
      const subscriptionObject = subscription.toJSON ? subscription.toJSON() : subscription;
      
      console.log('Sending subscription to server:', subscriptionObject);
      
      const response = await fetch('/api/notifications/subscribe-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscriptionObject
        })
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Server response text:', responseText);
      
      // Parse the response if it's JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Response is not valid JSON:', e);
        setDebugInfo(prev => ({ ...prev, parseError: e.message, rawResponse: responseText }));
        throw new Error('Invalid JSON response');
      }

      if (!response.ok) {
        console.error('Error sending subscription:', result);
        setDebugInfo(prev => ({ ...prev, serverError: responseText }));
        throw new Error(`Server error: ${response.status}`);
      }

      setDebugInfo(prev => ({ ...prev, serverResponse: result }));
      return result;
    } catch (error) {
      console.error('Error updating subscription on server:', error);
      setDebugInfo(prev => ({ ...prev, updateError: error.message }));
      throw error;
    }
  };

  const forceServiceWorkerUpdate = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service Worker unregistered to force update');
        }
        // Reload the page to re-register the service worker
        window.location.reload();
      } catch (error) {
        console.error('Error refreshing service worker:', error);
        toast.error(`Error refreshing: ${error.message}`);
      }
    }
  };

  // Funcția de conversie pentru cheile VAPID
  function urlBase64ToUint8Array(base64String) {
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
  }

  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
        <p className="text-sm text-yellow-700">This browser does not support push notifications.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Notifications for new orders</h3>
      <p className="text-sm text-gray-600 mb-4">
        {isSubscribed ? 
          'You are subscribed to notifications for new orders.' : 
          'Subscribe to receive notifications when new orders arrive.'}
      </p>
      
      <div className="flex space-x-4">
        {!isSubscribed ? (
          <button
            onClick={subscribeUser}
            disabled={isSubscribing}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isSubscribing ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSubscribing ? 'Processing...' : 'Subscribe to notifications'}
          </button>
        ) : (
          <button
            onClick={unsubscribeUser}
            disabled={isSubscribing}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isSubscribing ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Unsubscribe
          </button>
        )}
        
        <button 
          onClick={forceServiceWorkerUpdate}
          className="text-sm text-indigo-600 underline cursor-pointer"
        >
          Refresh service worker
        </button>
      </div>
      
      {/* Secțiune de debugging - poți ascunde în producție */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <details>
          <summary className="text-xs text-gray-500 cursor-pointer">Informații debugging</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs font-mono text-gray-700 whitespace-pre-wrap">
            <p>Public Key: {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 10)}...</p>
            <p>Status: {JSON.stringify(debugInfo, null, 2)}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default NotificationSubscriber; 