'use client'

import React from 'react';
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// Temporarily disabled - notifications will be implemented later
// import AdminNotificationSubscription from '@/components/admin/AdminNotificationSubscription'

export default function AdminDashboard() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    newCustomers: 0,
    pendingOrders: 0,
    recentOrders: [],
    salesByMonth: []
  })

  useEffect(() => {
    // Verifică dacă utilizatorul este autentificat
    if (!user) {
      router.push('/login?redirect=/admin/dashboard')
      return
    }

    // Verifică dacă utilizatorul este admin
    const checkAdminStatus = async () => {
      try {
        setLoading(true)
        
        // Întâi, verificăm dacă există un profil
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);
          
        if (checkError) throw checkError;
        
        // Dacă nu există profil, îl creăm
        if (!existingProfile || existingProfile.length === 0) {
          console.log('Creating new profile for user:', user.id);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              is_admin: false,
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setIsAdmin(false);
            return;
          }
        }
        
        // Verificăm statusul de admin într-un mod mai robust
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle(); // Folosește maybeSingle() în loc de single()
        
        if (error) throw error;
        
        // Dacă nu există profil, îl creăm
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              is_admin: false,
              updated_at: new Date().toISOString()
            });
          
          if (insertError) throw insertError;
          setIsAdmin(false);
        } else {
          // Profilul există, verificăm statusul de admin
          console.log('Admin status from DB:', profile.is_admin);
          setIsAdmin(!!profile.is_admin);
          
          // Dacă este admin, încărcăm statisticile
          if (profile.is_admin) {
            await loadStats();
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, router, supabase]);

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Comenzi totale
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      if (ordersError) throw ordersError
      
      // Vânzări totale 
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('total')
      
      if (salesError) throw salesError
      
      const totalSales = salesData?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0
      
      // Clienți noi din ultima lună
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      
      const { count: newCustomers, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString())
      
      if (customersError) throw customersError
      
      // Comenzi în așteptare - MODIFICAT: caută ambele statusuri 'pending' și 'processing'
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing']) // MODIFICARE: include ambele statusuri
      
      if (pendingError) throw pendingError
      
      // Comenzi recente - MODIFICAT pentru a evita relația directă cu profiles
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total,
          status,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentError) throw recentError

      // Îmbogățim datele de comenzi cu informații despre utilizatori
      let ordersWithUserInfo = []
      if (recentOrders && recentOrders.length > 0) {
        // Obținem ID-urile utilizatorilor
        const userIds = [...new Set(recentOrders.map(order => order.user_id).filter(Boolean))]
        
        // Preluăm informațiile despre utilizatori într-un query separat (doar dacă avem ID-uri valide)
        let usersData = []
        if (userIds.length > 0) {
          const { data, error: usersError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds)
          if (usersError) throw usersError
          usersData = data || []
        }
        
        // Creăm un mapping pentru lookup rapid
        const userMap = {}
        if (usersData) {
          usersData.forEach(user => {
            userMap[user.id] = user
          })
        }
        
        // Combinăm datele de comenzi cu informațiile utilizatorilor
        ordersWithUserInfo = recentOrders.map(order => ({
          ...order,
          profiles: order.user_id ? (userMap[order.user_id] || { email: 'N/A' }) : { email: 'Guest' }
        }))
      }
      
      // Date vânzări după lună (date reale din baza de date)
      const salesByMonth = await fetchSalesByMonth()
      
      setStats({
        totalOrders,
        totalSales,
        newCustomers,
        pendingOrders,
        recentOrders: ordersWithUserInfo || [], // Folosim datele îmbogățite
        salesByMonth
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Funcție pentru a obține vânzările reale grupate pe luni
  const fetchSalesByMonth = async () => {
    try {
      // Obține toate comenzile
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total')
        .order('created_at')
      
      if (error) throw error

      if (!orders || orders.length === 0) {
        return []
      }

      // Creează un map pentru a grupa vânzările pe luni
      const monthlyData = {}
      
      // Numele lunilor pentru afișare
      const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      // Procesează comenzile și calculează vânzările totale pe luni
      orders.forEach(order => {
        const date = new Date(order.created_at)
        const year = date.getFullYear()
        const month = date.getMonth() // 0-11
        
        // Creează cheia pentru luna și anul respectiv (ex: "2023-5" pentru Mai 2023)
        const monthKey = `${year}-${month}`
        
        // Adaugă suma la luna respectivă sau inițializează cu suma curentă
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].sales += parseFloat(order.total || 0)
          monthlyData[monthKey].count += 1
        } else {
          monthlyData[monthKey] = {
            name: monthNames[month],
            sales: parseFloat(order.total || 0),
            count: 1,
            year,
            month
          }
        }
      })
      
      // Convertește map-ul în array și sortează după an și lună
      let result = Object.values(monthlyData).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
      
      // Păstrează doar ultimele 12 luni pentru grafic
      if (result.length > 12) {
        result = result.slice(result.length - 12)
      }
      
      // Rotunjește valorile pentru afișare
      result.forEach(item => {
        item.sales = Math.round(item.sales * 100) / 100
      })
      
      return result
    } catch (error) {
      console.error('Error fetching sales by month:', error)
      return []
    }
  }

  // Funcția de obținere a comenzilor
  const fetchOrders = async () => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, user:profiles(email)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Eroare la obținerea comenzilor:', error);
      return [];
    }
    
    // Returnăm comenzile cu datele formatate
    return orders.map(order => ({
      ...order,
      client: order.user?.email || 'Utilizator necunoscut',
      // Asigură-te că statusul este salvat corect
      status: order.status || 'processing' // Valoare implicită dacă statusul lipsește
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">👋</span>
              Bună ziua, Admin!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Iată o privire de ansamblu asupra magazinului tău MySweetMagnets
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              🟢 Sistem Activ
            </div>
            <div className="text-sm text-gray-500">
              Ultima actualizare: {new Date().toLocaleTimeString('ro-RO')}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-200 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Notificări Admin</h3>
              <p className="text-blue-700 mb-2">
                Primești notificări instant pentru comenzi noi și cereri importante
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span className="mr-2">🚀</span>
                <span className="italic">Funcționalitatea va fi disponibilă în curând...</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            În dezvoltare
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <span className="text-white text-lg">📦</span>
            </div>
            <div className="text-purple-600 text-sm font-medium">Total</div>
          </div>
          <h3 className="text-sm font-medium text-purple-700 mb-1">Comenzi Totale</h3>
          <p className="text-3xl font-bold text-purple-900">{stats.totalOrders}</p>
          <div className="mt-2 text-xs text-purple-600">Toate comenzile procesate</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <span className="text-white text-lg">💰</span>
            </div>
            <div className="text-green-600 text-sm font-medium">Revenue</div>
          </div>
          <h3 className="text-sm font-medium text-green-700 mb-1">Vânzări Totale</h3>
          <p className="text-3xl font-bold text-green-900">£{stats.totalSales.toFixed(2)}</p>
          <div className="mt-2 text-xs text-green-600">Valoarea totală încasată</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <span className="text-white text-lg">👥</span>
            </div>
            <div className="text-blue-600 text-sm font-medium">Noi</div>
          </div>
          <h3 className="text-sm font-medium text-blue-700 mb-1">Clienți Noi</h3>
          <p className="text-3xl font-bold text-blue-900">{stats.newCustomers}</p>
          <div className="mt-2 text-xs text-blue-600">Înregistrați luna aceasta</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <span className="text-white text-lg">⏳</span>
            </div>
            <div className="text-orange-600 text-sm font-medium">Urgent</div>
          </div>
          <h3 className="text-sm font-medium text-orange-700 mb-1">Comenzi în Așteptare</h3>
          <p className="text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
          <div className="mt-2 text-xs text-orange-600">
            {stats.pendingOrders > 0 ? '🔥 Necesită atenție!' : '✅ Totul la zi'}
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📊</span>
                Vânzări După Lună
              </h3>
              <p className="text-sm text-gray-600">Evoluția veniturilor în timp</p>
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
              £ GBP
            </div>
          </div>
          {stats.salesByMonth.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nu există date suficiente pentru afișarea graficului
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`£${value}`, 'Vânzări']} />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Vânzări (£)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">📈</span>
                Număr Comenzi pe Lună
              </h3>
              <p className="text-sm text-gray-600">Trendul comenzilor în timp</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              Comenzi
            </div>
          </div>
          {stats.salesByMonth.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nu există date suficiente pentru afișarea graficului
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Număr comenzi" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🛍️</span>
              Comenzi Recente
            </h3>
            <p className="text-sm text-gray-600">Ultimele comenzi plasate de clienți</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <span className="mr-1">👀</span>
            Vezi toate
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există comenzi recente</h4>
              <p className="text-gray-500">Comenzile vor apărea aici când clienții plasează comenzi noi</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:underline">
                        {order.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.profiles?.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">£{parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🚀</span>
          Acțiuni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/orders" className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📋</span>
              </div>
              <div className="text-indigo-600 text-sm font-medium bg-indigo-200 px-2 py-1 rounded-full">
                {stats.totalOrders} total
              </div>
            </div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Gestionare Comenzi</h3>
            <p className="text-indigo-700 text-sm mb-3">Vizualizează și actualizează statusul comenzilor</p>
            <div className="flex items-center text-indigo-600 text-sm font-medium">
              <span className="mr-1">Accesează</span>
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/admin/deletion-requests" className="group bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">🗑️</span>
              </div>
              <div className="text-red-600 text-sm font-medium bg-red-200 px-2 py-1 rounded-full">
                GDPR
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Cereri Ștergere</h3>
            <p className="text-red-700 text-sm mb-3">Gestionează cererile de ștergere conturi GDPR</p>
            <div className="flex items-center text-red-600 text-sm font-medium">
              <span className="mr-1">Verifică</span>
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/admin/customers" className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-purple-600 text-sm font-medium bg-purple-200 px-2 py-1 rounded-full">
                {stats.newCustomers} noi
              </div>
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Gestionare Clienți</h3>
            <p className="text-purple-700 text-sm mb-3">Vizualizează și gestionează informații clienți</p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <span className="mr-1">Explorează</span>
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-200 p-2 rounded-lg mr-3">
              <span className="text-lg">ℹ️</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">MySweetMagnets Admin Panel</h4>
              <p className="text-sm text-gray-600">Gestionează magazinul tău de magneți personalizați</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Versiunea 1.0</div>
            <div className="text-xs text-gray-400">Ultima actualizare: Noiembrie 2024</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
