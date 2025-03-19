"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import NotificationSubscription from '@/components/NotificationSubscription'
import PushNotificationSubscriber from '@/components/PushNotificationSubscriber'

export default function AccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  
  // Un singur useEffect pentru verificarea autentificării și încărcarea datelor
  useEffect(() => {
    // Adaugă o scurtă întârziere pentru a permite încărcarea stării de autentificare
    const timer = setTimeout(async () => {
      console.log("Checking authentication:", user)
      
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push('/login?redirect=/account')
        return
      }
      
      try {
        await loadUserData(user.id)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }, 300) // mică întârziere pentru stabilizarea stării
    
    return () => clearTimeout(timer)
  }, [user, router])
  
  const loadUserData = async (userId) => {
    try {
      // 1. Încărcăm comenzile utilizatorului
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, status, total')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (ordersError) throw ordersError
      
      let formattedOrders = [];
      
      if (ordersData && ordersData.length > 0) {
        // 2. Pentru fiecare comandă, obținem item-urile în query-uri separate
        for (const order of ordersData) {
          // Obținem item-urile comenzii
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*') // Selectăm toate coloanele pentru a vedea ce avem disponibil
            .eq('order_id', order.id)
          
          if (itemsError) {
            console.error('Error loading order items:', itemsError);
            continue;
          }
          
          // Adăugăm la array-ul de comenzi formatate - fără a încărcăm produse din altă tabelă
          formattedOrders.push({
            id: order.id,
            date: new Date(order.created_at).toISOString().split('T')[0],
            status: order.status,
            total: order.total,
            items: orderItems.map(item => ({
              id: item.id,
              name: item.product_name || item.name || `Magnet #${item.id}`,
              quantity: item.quantity || 1,
              price: item.price || 0,
              image: item.image_url || '/placeholder-image.jpg'
            }))
          });
        }
      }
      
      // Încărcă adresele utilizatorului din shipping_addresses în loc de addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('shipping_addresses') // Modificat din 'addresses' în 'shipping_addresses'
        .select('*')
        .eq('user_id', userId)
      
      if (addressesError) throw addressesError
      
      setOrders(formattedOrders)
      setAddresses(addressesData)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-pink-100 text-pink-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'addresses' ? 'bg-pink-100 text-pink-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Addresses
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'settings' ? 'bg-pink-100 text-pink-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Account Settings
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-4">My Orders</h2>
              
              {orders.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-600">You haven't placed any orders yet.</p>
                  <a href="/products" className="mt-4 inline-block text-pink-600 hover:text-pink-700">
                    Start Shopping
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{order.id}</h3>
                          <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center">
                            <div className="h-16 w-16 relative rounded overflow-hidden">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-medium">£{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-900">My Addresses</h2>
                <button className="text-sm px-3 py-1 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50">
                  Add New Address
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-600">You haven't added any address yet.</p>
                  <button className="mt-4 inline-block text-pink-600 hover:text-pink-700">
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(address => (
                    <div key={address.id} className="bg-white p-4 rounded-lg shadow-sm border relative">
                      {address.is_default && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-pink-100 text-pink-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                      <p className="font-medium mb-1">{address.name || 'My Address'}</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.full_name}</p>
                        <p>{address.street_address}</p>
                        <p>{address.city}, {address.postal_code}</p>
                        <p>{address.country}</p>
                        {address.phone && <p>Phone: {address.phone}</p>}
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button className="text-xs text-gray-600 hover:text-gray-800">Edit</button>
                        <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-4">Account Settings</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-6">
                  {/* Profil personal */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          defaultValue={user?.user_metadata?.first_name || ""}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          defaultValue={user?.user_metadata?.last_name || ""}
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 shadow-sm"
                          value={user?.email || ""}
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Pentru a schimba adresa de email, contactează-ne.</p>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          defaultValue={user?.user_metadata?.phone || ""}
                          placeholder="+44 70 1234 5678"
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gradient-to-r from-pink-400 to-amber-400 text-white rounded-md hover:from-pink-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          onClick={async () => {
                            // Implementează actualizarea profilului
                            const firstName = document.getElementById('firstName').value;
                            const lastName = document.getElementById('lastName').value;
                            const phone = document.getElementById('phone').value;
                            
                            const { error } = await supabase.auth.updateUser({
                              data: { 
                                first_name: firstName,
                                last_name: lastName,
                                phone: phone
                              }
                            });
                            
                            if (error) {
                              alert('Error updating profile: ' + error.message);
                            } else {
                              alert('Profile updated successfully!');
                            }
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Schimbare parolă */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gradient-to-r from-pink-400 to-amber-400 text-white rounded-md hover:from-pink-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          onClick={async () => {
                            const currentPassword = document.getElementById('currentPassword').value;
                            const newPassword = document.getElementById('newPassword').value;
                            const confirmPassword = document.getElementById('confirmPassword').value;
                            
                            if (!currentPassword || !newPassword || !confirmPassword) {
                              alert('Please fill in all password fields');
                              return;
                            }
                            
                            if (newPassword !== confirmPassword) {
                              alert('New passwords do not match');
                              return;
                            }
                            
                            // Pentru Supabase, schimbarea parolei poate necesita API diferit
                            // sau autentificare din nou înainte de schimbare
                            const { error } = await supabase.auth.updateUser({
                              password: newPassword
                            });
                            
                            if (error) {
                              alert('Error changing password: ' + error.message);
                            } else {
                              alert('Password changed successfully!');
                              // Reset form
                              document.getElementById('currentPassword').value = '';
                              document.getElementById('newPassword').value = '';
                              document.getElementById('confirmPassword').value = '';
                            }
                          }}
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Preferințe notificări */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            type="checkbox"
                            className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email notifications</label>
                          <p className="text-gray-500">Primește emailuri despre oferte speciale și noutăți.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="orderUpdates"
                            type="checkbox"
                            className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="orderUpdates" className="font-medium text-gray-700">Order updates</label>
                          <p className="text-gray-500">Primește emailuri despre statusul comenzilor tale.</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gradient-to-r from-pink-400 to-amber-400 text-white rounded-md hover:from-pink-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          onClick={() => {
                            // Implementează salvarea preferințelor
                            const emailNotifications = document.getElementById('emailNotifications').checked;
                            const orderUpdates = document.getElementById('orderUpdates').checked;
                            
                            // Trimite către server
                            alert('Preferences saved!');
                          }}
                        >
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ștergere cont */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Când îți ștergi contul, toate datele tale personale vor fi șterse. Această acțiune nu poate fi anulată.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={async () => {
                        if (window.confirm('Ești sigur că vrei să-ți ștergi contul? Această acțiune nu poate fi anulată.')) {
                          try {
                            // Opțional, poți adăuga un prompt pentru motiv
                            const reason = prompt('Ai putea să ne spui de ce dorești să îți ștergi contul? (opțional)');
                            
                            // Salvează cererea în baza de date
                            const { error } = await supabase
                              .from('deletion_requests')
                              .insert({
                                user_id: user.id,
                                email: user.email,
                                reason: reason || 'Nu a fost specificat',
                                status: 'pending'
                              });
                              
                            if (error) {
                              console.error('Error saving deletion request:', error);
                              alert('A apărut o eroare. Te rugăm să încerci din nou sau să ne contactezi direct.');
                            } else {
                              alert('Cererea ta de ștergere a contului a fost înregistrată. Echipa noastră o va procesa în curând.');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('A apărut o eroare. Te rugăm să încerci din nou.');
                          }
                        }
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notificări</h3>
            <div className="mt-2">
              <PushNotificationSubscriber />
              <p className="mt-2 text-sm text-gray-500">
                Activează notificările pentru a primi actualizări despre comenzile tale 
                și promoții speciale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 