"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminNotificationSubscription() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vapidPublicKey, setVapidPublicKey] = useState(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null)

  // Verifică dacă notificările push sunt suportate
  const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window && vapidPublicKey
  }

  // Verifică sau configurează sistemul de notificări
  useEffect(() => {
    // Temporarily disabled - notifications will be implemented later
    /*
    if (!vapidPublicKey) {
      console.log('Obțin cheile de configurare pentru notificări...');
      fetch('/api/setup-notifications')
        .then(response => response.json())
        .then(data => {
          if (data.success && data.vapidPublicKey) {
            setVapidPublicKey(data.vapidPublicKey);
            console.log('Chei obținute cu succes');
          } else {
            console.error('Eroare la configurarea notificărilor:', data.message);
            setError('Sistemul de notificări nu este configurat corect.');
          }
        })
        .catch(err => {
          console.error('Eroare la configurarea notificărilor:', err);
          setError('Nu s-a putut configura sistemul de notificări.');
        });
    }
    */
  }, [vapidPublicKey]);

  // Verifică dacă utilizatorul este admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Obține statusul de admin din localStorage
        const adminStatus = localStorage.getItem(`admin_status_${user.id}`)
        
        if (adminStatus === 'true') {
          console.log('Admin status din localStorage: true');
          setIsAdmin(true)
          // Temporarily disabled - notifications will be implemented later
          /*
          if (isPushSupported()) {
            await registerServiceWorker()
          }
          */
        } else {
          // Verifică și la server pentru a fi sigur
          const response = await fetch('/api/check-admin')
          
          if (!response.ok) {
            throw new Error(`Eroare server: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('Admin status from DB:', data.isAdmin);
          setIsAdmin(data.isAdmin)
          localStorage.setItem(`admin_status_${user.id}`, data.isAdmin.toString())
          
          // Temporarily disabled - notifications will be implemented later
          /*
          if (data.isAdmin && isPushSupported()) {
            await registerServiceWorker()
          }
          */
        }
      } catch (err) {
        console.error('Eroare la verificarea statusului de admin:', err)
        setError('Nu s-a putut verifica statusul de administrator.')
      } finally {
        setLoading(false)
      }
    }
    
    checkAdmin()
  }, [user])

  // Înregistrează service worker-ul
  const registerServiceWorker = async () => {
    // Temporarily disabled - notifications will be implemented later
    /*
    try {
      if (!isPushSupported()) {
        console.log('Notificările push nu sunt suportate în acest browser sau nu sunt configurate.')
        return
      }

      console.log('Înregistrez service worker-ul...')
      
      // Înregistrează service worker-ul
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker înregistrat cu succes:', registration)
      
      // Așteaptă ca service worker-ul să fie ready
      await navigator.serviceWorker.ready
      console.log('Service Worker este ready')
      
      // Verifică dacă există un abonament existent
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        console.log('Am găsit un abonament existent:', existingSubscription)
        setSubscription(existingSubscription)
        setIsSubscribed(true)
        // Actualizează abonamentul pe server pentru a fi sigur
        await updateSubscriptionOnServer(existingSubscription)
      } else {
        console.log('Nu există un abonament anterior, creez unul nou')
        // Solicită permisiunile și creează un abonament nou
        await subscribeUserToPush(registration)
      }
    } catch (err) {
      console.error('Eroare la înregistrarea Service Worker:', err)
      setError('Nu s-a putut înregistra service worker-ul.')
    }
    */
  }

  // Creează un abonament nou pentru notificările push
  const subscribeUserToPush = async (registration) => {
    // Temporarily disabled - notifications will be implemented later
    /*
    try {
      console.log('Solicit permisiuni pentru notificări...')
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        throw new Error('Permisiunea de notificări a fost refuzată')
      }
      
      if (!vapidPublicKey) {
        throw new Error('Lipsește cheia VAPID publică')
      }
      
      console.log('Convertesc cheia publică:', vapidPublicKey.substring(0, 10) + '...')
      // Convertește cheia publică în array de bytes
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
      
      console.log('Creez abonament push...')
      // Creează abonamentul
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })
      
      console.log('Abonament creat:', newSubscription)
      setSubscription(newSubscription)
      setIsSubscribed(true)
      
      // Trimite abonamentul la server
      await updateSubscriptionOnServer(newSubscription)
    } catch (err) {
      console.error('Eroare la abonare:', err)
      setError('Nu s-a putut crea abonamentul pentru notificări.')
    }
    */
  }

  // Trimite abonamentul la server
  const updateSubscriptionOnServer = async (subscription) => {
    // Temporarily disabled - notifications will be implemented later
    /*
    try {
      console.log('Trimit abonamentul la server...')
      const response = await fetch('/api/notifications/subscribe-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Eroare la trimiterea abonamentului:', errorText)
        throw new Error(`Eroare server: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('Abonament trimis cu succes la server')
      } else {
        console.error('Eroare la trimiterea abonamentului:', data)
        throw new Error(data.message || 'Eroare necunoscută')
      }
    } catch (err) {
      console.error('Eroare la actualizarea abonamentului pe server:', err)
      setError('Nu s-a putut salva abonamentul.')
    }
    */
  }

  // Utilitar pentru convertirea cheii din base64 în Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
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

  // Nu afișăm nimic în UI, componenta gestionează doar abonamentele
  return null
} 