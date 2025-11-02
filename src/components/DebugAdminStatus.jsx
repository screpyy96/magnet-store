'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Component de debugging pentru statusul de admin
 * Adaugă acest component temporar în orice pagină pentru a verifica statusul admin
 * 
 * Exemplu de utilizare:
 * import DebugAdminStatus from '@/components/DebugAdminStatus'
 * 
 * function MyPage() {
 *   return (
 *     <>
 *       <DebugAdminStatus />
 *       // ... rest of page
 *     </>
 *   )
 * }
 */
export default function DebugAdminStatus() {
  const { user, isAdmin, refreshSession, supabase } = useAuth()
  const [apiStatus, setApiStatus] = useState(null)
  const [dbStatus, setDbStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (user) {
      checkAllStatuses()
    }
  }, [user])

  const checkAllStatuses = async () => {
    // Check API
    try {
      const res = await fetch('/api/check-admin', { credentials: 'include' })
      const data = await res.json()
      setApiStatus(data.isAdmin)
    } catch (error) {
      setApiStatus('error')
    }

    // Check DB directly
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()
      
      if (error) {
        setDbStatus('error: ' + error.message)
      } else {
        setDbStatus(data?.is_admin || false)
      }
    } catch (error) {
      setDbStatus('error')
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await refreshSession()
    await checkAllStatuses()
    setLoading(false)
    alert('Session refreshed! Reloading page...')
    window.location.reload()
  }

  const handleClearCache = () => {
    localStorage.clear()
    sessionStorage.clear()
    alert('Cache cleared! Reloading page...')
    window.location.reload()
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="Show Admin Debug Panel"
      >
        🔧
      </button>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-purple-600 rounded-lg shadow-2xl p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-purple-900">🔧 Admin Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="border-b pb-2">
          <p className="text-gray-600">User ID:</p>
          <p className="font-mono text-xs break-all">{user.id}</p>
        </div>

        <div className="border-b pb-2">
          <p className="text-gray-600">Email:</p>
          <p className="font-semibold">{user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-600 text-xs">Context isAdmin:</p>
            <p className={`font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? '✅ TRUE' : '❌ FALSE'}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-xs">API Status:</p>
            <p className={`font-bold ${apiStatus === true ? 'text-green-600' : apiStatus === false ? 'text-red-600' : 'text-orange-600'}`}>
              {apiStatus === true ? '✅ TRUE' : apiStatus === false ? '❌ FALSE' : '⚠️ ' + apiStatus}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-xs">DB Status:</p>
            <p className={`font-bold ${dbStatus === true ? 'text-green-600' : dbStatus === false ? 'text-red-600' : 'text-orange-600'}`}>
              {dbStatus === true ? '✅ TRUE' : dbStatus === false ? '❌ FALSE' : '⚠️ ' + dbStatus}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-xs">All Match:</p>
            <p className={`font-bold ${isAdmin === apiStatus && apiStatus === dbStatus ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin === apiStatus && apiStatus === dbStatus ? '✅ YES' : '❌ NO'}
            </p>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 disabled:opacity-50 text-sm font-semibold"
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh Session'}
          </button>

          <button
            onClick={handleClearCache}
            className="w-full bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm font-semibold"
          >
            🗑️ Clear Cache & Reload
          </button>

          <button
            onClick={checkAllStatuses}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
          >
            🔍 Recheck Status
          </button>
        </div>

        <div className="pt-2 border-t text-xs text-gray-500">
          <p className="font-semibold mb-1">Quick Fixes:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Run SQL: <code className="bg-gray-100 px-1">UPDATE profiles SET is_admin=TRUE WHERE email='{user.email}'</code></li>
            <li>Click "Clear Cache & Reload"</li>
            <li>Logout and login again</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
