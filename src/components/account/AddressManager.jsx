'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';

export default function AddressManager() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'United Kingdom',
    phone: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      
      console.log('Fetched addresses:', data);
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddOrUpdateAddress = async (e) => {
    e.preventDefault();
    
    try {
      const supabase = createClientComponentClient();
      
      // Verificați utilizatorul curent
      console.log('Current user when saving:', user);
      
      const addressData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      console.log('Saving address data:', addressData);
      
      // Logați detalii despre sesiune înainte de a încerca inserarea
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      // Dacă este bifat ca adresă implicită, setează toate celelalte ca non-implicite
      if (formData.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || '00000000-0000-0000-0000-000000000000');
      }
      
      let response;
      if (editingAddress) {
        // Actualizare adresă existentă
        response = await supabase
          .from('shipping_addresses')
          .update(addressData)
          .eq('id', editingAddress.id)
          .select();
      } else {
        // Adăugare adresă nouă
        addressData.created_at = new Date().toISOString();
        console.log('Inserting new address with data:', addressData);
        response = await supabase
          .from('shipping_addresses')
          .insert(addressData)
          .select();
        
        console.log('Insert response:', response);
      }
      
      if (response.error) {
        console.error('Detailed error:', response.error);
        throw response.error;
      }
      
      // Resetează formularul și reîncarcă adresele
      resetForm();
      fetchAddresses();
      
    } catch (error) {
      console.error('Full error object:', error);
      alert(`Failed to save address: ${error.message}`);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Reîncarcă adresele după ștergere
      fetchAddresses();
      
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(`Failed to delete address: ${error.message}`);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const supabase = createClientComponentClient();
      
      // Mai întâi setăm toate adresele ca non-implicite
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Apoi setăm adresa selectată ca implicită
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Reîncarcă adresele
      fetchAddresses();
      
    } catch (error) {
      console.error('Error setting default address:', error);
      alert(`Failed to set default address: ${error.message}`);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      county: address.county,
      postal_code: address.postal_code,
      country: address.country || 'United Kingdom',
      phone: address.phone,
      is_default: address.is_default
    });
    
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      county: '',
      postal_code: '',
      country: 'United Kingdom',
      phone: '',
      is_default: false
    });
    
    setEditingAddress(null);
    setShowAddForm(false);
  };

  if (loading && !addresses.length) {
    return <div className="py-4 text-center text-gray-500">Loading your addresses...</div>;
  }

  return (
    <div className="space-y-6">
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Address
        </button>
      )}
      
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleAddOrUpdateAddress} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                  County
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={formData.is_default}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Your Addresses</h3>
        
        {addresses.length === 0 ? (
          <p className="text-gray-500">You haven't added any addresses yet.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{address.full_name}</p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.county} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p>{address.phone}</p>
                    {address.is_default && (
                      <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Set as Default
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 