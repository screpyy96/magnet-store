'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AdminNotificationSubscription from '@/components/admin/AdminNotificationSubscription'

export default function AdminDashboard() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    newCustomers: 0,
    pendingOrders: 0,
    recentOrders: [],
    salesByMonth: []
  })

  useEffect(() => {
    const checkAdmin = async () => {
      setTimeout(async () => {
        setIsLoading(true)
        
        if (!user) {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session?.user) {
            console.log("Nu s-a găsit nicio sesiune activă");
            router.push('/login?redirect=/admin/dashboard')
            return
          }
          
          const userId = session.user.id
          console.log("ID utilizator din sesiune:", userId)
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single()
          
          if (error) {
            console.error('Eroare la verificarea profilului:', error)
            router.push('/')
            return
          }
          
          if (!profile || !profile.is_admin) {
            console.log("Utilizatorul nu are rol de admin")
            router.push('/')
            return
          }
          
          console.log("Autentificare admin reușită")
          setIsAdmin(true)
          loadStats()
        } else {
          try {
            console.log("Verificare admin pentru utilizatorul:", user.id)
            
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', user.id)
              .single()
            
            if (error) throw error
            
            if (!profile || !profile.is_admin) {
              console.log("Utilizatorul nu are rol de admin")
              router.push('/')
              return
            }
            
            console.log("Autentificare admin reușită")
            setIsAdmin(true)
            loadStats()
          } catch (error) {
            console.error('Eroare la verificarea rolului admin:', error)
            router.push('/')
          }
        }
        
        setIsLoading(false)
      }, 500)
    }

    checkAdmin()
  }, [user, router, supabase])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      
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
      
      // Comenzi în așteptare
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
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
        const userIds = [...new Set(recentOrders.map(order => order.user_id))]
        
        // Preluăm informațiile despre utilizatori într-un query separat
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds)
        
        if (usersError) throw usersError
        
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
          profiles: userMap[order.user_id] || { email: 'N/A' }
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
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your store, orders, and customers.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-2">Notificări Admin</h3>
        <p className="text-sm text-gray-600 mb-2">
          Primești notificări instant când sunt plasate comenzi noi sau când apar cereri importante.
        </p>
        <AdminNotificationSubscription />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Comenzi Totale</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <div className="mt-2 text-xs text-gray-600">Toate comenzile</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Vânzări Totale</h3>
          <p className="text-3xl font-bold text-gray-900">£{stats.totalSales.toFixed(2)}</p>
          <div className="mt-2 text-xs text-gray-600">Valoarea totală</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Clienți Noi</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.newCustomers}</p>
          <div className="mt-2 text-xs text-gray-600">Ultima lună</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Comenzi în Așteptare</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
          <div className="mt-2 text-xs text-amber-600">Necesită procesare</div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Vânzări După Lună</h3>
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
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Număr Comenzi pe Lună</h3>
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Comenzi Recente</h3>
          <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm">
            Vezi toate
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nu există comenzi recente
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Gestionare Comenzi</h3>
              <p className="text-sm text-gray-500">Vizualizează și actualizează statusul comenzilor</p>
            </div>
            <div className="ml-auto">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/deletion-requests" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-red-100 p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Cereri Ștergere Conturi</h3>
              <p className="text-sm text-gray-500">Gestionează cererile de ștergere conturi</p>
            </div>
            <div className="ml-auto">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/customers" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Gestionare Clienți</h3>
              <p className="text-sm text-gray-500">Vizualizează informații despre clienți</p>
            </div>
            <div className="ml-auto">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
} 