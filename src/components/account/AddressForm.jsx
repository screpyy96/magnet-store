'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';

export default function AddressForm({ existingAddress = null, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: existingAddress?.full_name || '',
    addressLine1: existingAddress?.address_line1 || '',
    addressLine2: existingAddress?.address_line2 || '',
    city: existingAddress?.city || '',
    county: existingAddress?.county || '',
    postalCode: existingAddress?.postal_code || '',
    country: existingAddress?.country || 'United Kingdom',
    phone: existingAddress?.phone || '',
    is_default: existingAddress?.is_default || false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Foarte important: Aici trebuie să mapezi numele câmpurilor din form la numele coloanelor din baza de date
      const addressData = {
        user_id: user.id,
        full_name: formData.fullName,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        city: formData.city,
        county: formData.county,
        postal_code: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        is_default: formData.is_default,
        updated_at: new Date().toISOString()
      };
      
      console.log('Submitting address data:', addressData);
      
      const supabase = createClientComponentClient();
      
      // Dacă "is_default" este true, setează toate celelalte adrese ca non-default
      if (formData.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', existingAddress?.id || '');
      }
      
      // Actualizează sau creează adresa
      let response;
      if (existingAddress?.id) {
        response = await supabase
          .from('shipping_addresses')
          .update(addressData)
          .eq('id', existingAddress.id)
          .select();
      } else {
        // Pentru adresă nouă, adaugă și created_at
        addressData.created_at = new Date().toISOString();
        response = await supabase
          .from('shipping_addresses')
          .insert(addressData)
          .select();
      }
      
      if (response.error) {
        console.error('Error saving address:', response.error);
        throw new Error(response.error.message);
      }
      
      console.log('Address saved successfully:', response.data);
      if (onSuccess) onSuccess(response.data[0]);
    } catch (error) {
      console.error('Error in address form submission:', error);
      alert(`Failed to save address: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
          Address Line 1
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
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
            onChange={handleChange}
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
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
          Set as default address
        </label>
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : existingAddress ? 'Update Address' : 'Add Address'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 