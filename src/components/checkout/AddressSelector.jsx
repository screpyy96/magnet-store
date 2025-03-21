'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AddressSelector({ selectedAddress, onAddressSelect }) {
  const { user, supabase } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addingNewAddress, setAddingNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postalCode: '',
    country: 'United Kingdom',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      loadAddresses()
    }
  }, [user])

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (error) throw error
      setAddresses(data)
      
      // Auto-select default address
      const defaultAddress = data.find(addr => addr.is_default)
      if (defaultAddress && !selectedAddress) {
        onAddressSelect(defaultAddress)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const handleAddNewAddress = async () => {
    try {
      // Verificăm mai întâi dacă avem toate câmpurile obligatorii
      if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || 
          !newAddress.county || !newAddress.postalCode || !newAddress.phone) {
        alert('Please fill in all required fields');
        return;
      }

      // Adăugăm logging pentru debugging
      console.log('Attempting to add new address:', newAddress);
      
      // Verificăm dacă utilizatorul este autentificat
      if (!user || !user.id) {
        console.error('User not authenticated');
        alert('You must be logged in to add a new address');
        return;
      }

      // Adăugăm userId la adresă
      const addressWithUserId = {
        ...newAddress,
        user_id: user.id,
        is_default: true  // Setăm această adresă ca implicită
      };

      console.log('Saving address with user_id:', addressWithUserId);
      console.log('Current user:', user);

      // Folosim createClient pentru a obține un client Supabase cu sesiunea actuală
      const supabase = createClientComponentClient();

      // Mai întâi, setăm toate adresele existente ca non-default
      const { error: updateError } = await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating existing addresses:', updateError);
        // Continuăm oricum, nu este o eroare critică
      }

      // Apoi adăugăm noua adresă
      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert(addressWithUserId)
        .select();

      if (error) {
        console.error('Error inserting new address:', error);
        alert(`Failed to add address: ${error.message}`);
        return;
      }

      console.log('Address added successfully:', data);

      // Adăugăm noua adresă la lista și o setăm ca selectată
      if (data && data.length > 0) {
        const newAddressFromDB = data[0];
        setAddresses(prevAddresses => [...prevAddresses, newAddressFromDB]);
        onAddressSelect(newAddressFromDB);
        setAddingNewAddress(false);
        
        // Resetăm formularul
        setNewAddress({
          fullName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          county: '',
          postalCode: '',
          country: 'United Kingdom',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert(`Error adding new address: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-6">Shipping Address</h2>
      
      {addresses.map(address => (
        <div 
          key={address.id}
          className={`border p-4 rounded-lg mb-4 cursor-pointer ${
            selectedAddress?.id === address.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
          }`}
          onClick={() => onAddressSelect(address)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{address.street}</p>
              <p className="text-gray-600">
                {address.city}, {address.postal_code}
              </p>
              <p className="text-gray-600">{address.country}</p>
            </div>
            {address.is_default && (
              <span className="text-sm text-indigo-600">Default</span>
            )}
          </div>
        </div>
      ))}

      {!addingNewAddress ? (
        <button
          onClick={() => setAddingNewAddress(true)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          + Add New Address
        </button>
      ) : (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Address</h3>
          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              <input
                type="text"
                id="addressLine1"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="addressLine2"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                  County
                </label>
                <input
                  type="text"
                  id="county"
                  value={newAddress.county}
                  onChange={(e) => setNewAddress({...newAddress, county: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={handleAddNewAddress}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Address
              </button>
              
              <button
                type="button"
                onClick={() => setAddingNewAddress(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 