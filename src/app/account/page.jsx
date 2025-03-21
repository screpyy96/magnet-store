"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/AuthContext"
import PushNotificationSubscriber from '@/components/PushNotificationSubscriber'
import AddressManager from '@/components/account/AddressManager'

export default function AccountPage() {
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoading) {
        router.push('/login')
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [user, isLoading, router])
  
  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </div>
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white shadow rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Account</h2>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Profile Information
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'orders' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Order History
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'addresses' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Addresses
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'notifications' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Notifications
              </button>
              
              <button
                onClick={signOut}
                className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 mt-8"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white shadow rounded-lg p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                <p className="text-gray-500">Feature coming soon. You'll be able to view your order history here.</p>
              </div>
            )}
            
            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Addresses</h2>
                <AddressManager />
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <PushNotificationSubscriber />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 