'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrdersManagement() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/orders')
      return
    }

    const checkAdminStatus = async () => {
      try {
        setLoading(true)
        
        console.log('Checking admin status for:', user.id)
        
        // Mai întâi, verificăm dacă există un profil pentru utilizator
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle() // Folosim maybeSingle în loc de single
        
        if (profileError) {
          console.error('Error checking profile:', profileError)
          throw profileError
        }
        
        console.log('Profile data received:', profileData)
        
        // Dacă profilul nu există, îl creăm
        if (!profileData) {
          console.log('Creating new profile for user:', user.id)
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              is_admin: false, // Implicit nu este admin
              updated_at: new Date().toISOString()
            })
          
          if (createError) {
            console.error('Error creating profile:', createError)
            throw createError
          }
          
          setIsAdmin(false)
          router.push('/')
          return
        }
        
        // Verificăm dacă utilizatorul este admin
        if (!profileData.is_admin) {
          console.log('User is not an admin:', profileData)
          setIsAdmin(false)
          router.push('/')
          return
        }
        
        console.log('User is admin, loading orders')
        setIsAdmin(true)
        await loadOrders()
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, router, filter, searchTerm, pagination.page, supabase])

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Build query for orders
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      // Apply search - only search by order ID for now
      if (searchTerm) {
        query = query.ilike('id', `%${searchTerm}%`);
      }
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Apply pagination
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
      
      const { data: ordersData, error } = await query;
  
      if (error) throw error;
  
      console.log('Orders loaded:', ordersData);
      
      // Get user profiles for the orders
      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
        
        let profilesData = []
        if (userIds.length > 0) {
          const { data: pData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
          } else {
            profilesData = pData || []
          }
        }

        // Create a map of user_id to profile
        const profilesMap = {};
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
        
        // Add profile data to orders
        const ordersWithProfiles = ordersData.map(order => ({
          ...order,
          profiles: order.user_id ? (profilesMap[order.user_id] || null) : { email: order.guest_email || 'Guest' }
        }));
        
        setOrders(ordersWithProfiles);
      } else {
        setOrders(ordersData || []);
      }
      
      setPagination({
        ...pagination,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.pageSize)
      });
    } catch (error) {
      console.error('Error loading orders:', error);
      // Show error to user
      alert('Eroare la încărcarea comenzilor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      
      // Actualizează lista local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      alert(`Status-ul comenzii #${orderId} a fost actualizat la ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('A apărut o eroare la actualizarea statusului.')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'completed':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔄'
      case 'paid':
        return '✅'
      case 'shipped':
        return '🚚'
      case 'completed':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  useEffect(() => {
    if (isAdmin) {
      loadOrders()
    }
  }, [filter, searchTerm, pagination.page, isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📋</span>
                Gestionare Comenzi
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Vizualizează și procesează comenzile clienților MySweetMagnets
              </p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="mr-2">📊</span>
                Total comenzi: <span className="font-semibold ml-1">{pagination.totalCount}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                <span className="mr-1">🟢</span>
                Sistem Activ
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">🔍</span>
            <h2 className="text-lg font-semibold text-gray-900">Filtrare și Căutare</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="mr-1">📊</span>
                Filtrează după Status
              </label>
              <select
                id="status-filter"
                value={filter}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
              >
                <option value="all">🔄 Toate Comenzile</option>
                <option value="pending">⏳ În Așteptare</option>
                <option value="processing">🔄 În Procesare</option>
                <option value="paid">✅ Plătite</option>
                <option value="shipped">🚚 Expediate</option>
                <option value="completed">🎉 Finalizate</option>
                <option value="cancelled">❌ Anulate</option>
              </select>
            </div>
            <div>
              <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="mr-1">🔎</span>
                Caută după ID sau Email
              </label>
              <input
                id="search-term"
                type="text"
                placeholder="Introdu ID comandă sau email client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders - Desktop Table & Mobile Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">🆔</span> ID Comandă
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">👤</span> Client
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">📅</span> Data
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">💰</span> Total
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">📊</span> Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <span className="mr-1">⚡</span> Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există comenzi</h4>
                        <p className="text-gray-500">Comenzile vor apărea aici când clienții plasează comenzi noi</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            #{order.id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {(order.profiles?.email || order.guest_email || 'G').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.profiles?.email || order.guest_email || 'Guest'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.user_id ? 'Cont înregistrat' : 'Client guest'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{formatDate(order.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">£{order.total?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                          >
                            <span className="mr-1">👁️</span>
                            Vezi
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există comenzi</h4>
                <p className="text-gray-500">Comenzile vor apărea aici când clienții plasează comenzi noi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-indigo-600">
                            {(order.profiles?.email || order.guest_email || 'G').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.profiles?.email || order.guest_email || 'Guest'}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{order.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {getStatusEmoji(order.status)} {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">💰 Total</div>
                        <div className="text-sm font-semibold text-gray-900">£{order.total?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">📅 Data</div>
                        <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                      >
                        <span className="mr-1">👁️</span>
                        Vezi Detalii
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
              {/* Mobile Pagination */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="mr-1">⬅️</span>
                  Anterior
                </button>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Pagina {pagination.page} din {pagination.totalPages}
                  </span>
                </div>
                <button
                  onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Următor
                  <span className="ml-1">➡️</span>
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 flex items-center">
                    <span className="mr-2">📊</span>
                    Afișare <span className="font-semibold mx-1">{orders.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}</span> - 
                    <span className="font-semibold mx-1">{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}</span> din 
                    <span className="font-semibold ml-1">{pagination.totalCount}</span> rezultate
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Anterior</span>
                      <span>⬅️</span>
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (pagination.page <= 3) {
                        page = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setPagination({...pagination, page})}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                            ${pagination.page === page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 font-semibold'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Următor</span>
                      <span>➡️</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  )
} 
