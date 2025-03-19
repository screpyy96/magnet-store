"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminNotificationSubscription() {
  const { user } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Service worker și push notifications sunt suportate
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          setRegistration(reg)
          return reg.pushManager.getSubscription()
        })
        .then(sub => {
          if (sub) {
            // Utilizatorul este deja abonat
            setIsSubscribed(true)
            setSubscription(sub)
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  // Verifică și actualizează abonamentul în backend când utilizatorul se conectează
  useEffect(() => {
    if (user && subscription) {
      updateSubscriptionOnServer(subscription)
    }
  }, [user, subscription])

  const subscribeToPushNotifications = async () => {
    if (!registration) return

    try {
      setIsSubscribing(true)
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })
      
      setSubscription(newSubscription)
      setIsSubscribed(true)
      
      // Trimite abonamentul la server ca admin
      await updateSubscriptionOnServer(newSubscription)
      
    } catch (error) {
      console.error('Failed to subscribe to admin push notifications:', error)
    } finally {
      setIsSubscribing(false)
    }
  }

  const updateSubscriptionOnServer = async (subscription) => {
    if (!user) return
    
    try {
      await fetch('/api/notifications/subscribe-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription
        }),
      })
    } catch (error) {
      console.error('Error saving admin subscription to server:', error)
    }
  }

  // Conversie necesară pentru cheia VAPID
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null // Browserul nu suportă push notifications
  }

  return (
    <div className="mt-4">
      {!isSubscribed ? (
        <button
          onClick={subscribeToPushNotifications}
          disabled={isSubscribing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-70"
        >
          {isSubscribing ? 'Se procesează...' : 'Activează notificările de administrator'}
        </button>
      ) : (
        <p className="text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Notificările de administrator sunt activate
        </p>
      )}
    </div>
  )
} 