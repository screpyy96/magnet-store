"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DeletionRequestsPage() {
  const { user, supabase } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Verifică dacă utilizatorul este admin
    const checkAdminAndLoadData = async () => {
      // Aici ai nevoie de o metodă de verificare a rolului admin
      // Aceasta poate fi prin verificarea unui câmp în profilul utilizatorului
      // sau printr-o tabelă separată de roluri
      
      await loadDeletionRequests()
    }
    
    checkAdminAndLoadData()
  }, [user])
  
  const loadDeletionRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deletion_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading deletion requests:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleProcessRequest = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      // Dacă statusul este 'approved', șterge contul utilizatorului
      if (newStatus === 'approved') {
        // Găsește cererea pentru a obține user_id
        const request = requests.find(r => r.id === id)
        
        if (request) {
          // Această operațiune ar trebui făcută printr-o funcție serverless
          // deoarece ștergerea utilizatorilor necesită drepturi administrative
          // Exemplu utilizând Edge Functions în Supabase:
          const { error: deleteError } = await supabase.functions.invoke('delete-user', {
            body: { userId: request.user_id }
          })
          
          if (deleteError) {
            console.error('Error deleting user:', deleteError)
            alert('Eroare la ștergerea contului. Verificați consola.')
          }
        }
      }
      
      // Reîncarcă lista
      await loadDeletionRequests()
      alert(`Cererea a fost marcată ca ${newStatus}`)
    } catch (error) {
      console.error('Error processing request:', error)
      alert('A apărut o eroare. Te rugăm să încerci din nou.')
    }
  }
  
  if (loading) {
    return <div className="p-8">Se încarcă...</div>
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Cereri de ștergere conturi</h1>
      
      {requests.length === 0 ? (
        <p>Nu există cereri de ștergere.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Motiv</th>
                <th className="py-2 px-4 border-b text-left">Data cererii</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{request.email}</td>
                  <td className="py-2 px-4 border-b">{request.reason}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProcessRequest(request.id, 'approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          Aprobă
                        </button>
                        <button
                          onClick={() => handleProcessRequest(request.id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Respinge
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 