'use client'

import { useState } from 'react'
import AddressAutocomplete from '@/components/checkout/AddressAutocomplete'

export default function GuestAddressForm({ onAddressChange, error }) {
  const [address, setAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'United Kingdom',
    phone: '',
    email: ''
  })

  const [errors, setErrors] = useState({})
  const [showLine2, setShowLine2] = useState(false)

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          newErrors.full_name = 'Full name is required'
        } else {
          delete newErrors.full_name
        }
        break
      case 'address_line1':
        if (!value.trim()) {
          newErrors.address_line1 = 'Address is required'
        } else {
          delete newErrors.address_line1
        }
        break
      // city/county optional (auto-filled via autocomplete)
      case 'city':
        if (!value.trim()) {
          delete newErrors.city
        } else {
          delete newErrors.city
        }
        break
      case 'county':
        if (!value.trim()) {
          delete newErrors.county
        } else {
          delete newErrors.county
        }
        break
      case 'postal_code':
        if (!value.trim()) {
          newErrors.postal_code = 'Postal code is required'
        } else {
          delete newErrors.postal_code
        }
        break
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required'
        } else {
          delete newErrors.phone
        }
        break
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Please enter a valid email'
        } else {
          delete newErrors.email
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedAddress = { ...address, [name]: value }
    setAddress(updatedAddress)
    
    validateField(name, value)
    
    // Check if all required fields are filled and valid
    const isValid = validateField(name, value) && 
      updatedAddress.full_name.trim() &&
      updatedAddress.email.trim() && /\S+@\S+\.\S+/.test(updatedAddress.email) &&
      updatedAddress.phone.trim() &&
      updatedAddress.address_line1.trim() &&
      updatedAddress.postal_code.trim()
    
    if (isValid) {
      onAddressChange(updatedAddress)
    } else {
      onAddressChange(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-200 p-6">
      <h3 className="text-lg font-medium text-pink-900 mb-4">Shipping Information</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* UK address autocomplete */}
      <AddressAutocomplete
        onSelect={(addr) => {
          const updated = { ...address, ...addr }
          setAddress(updated)
          onAddressChange(updated)
        }}
      />

      {/* Essentials first: Name, Email, Phone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={address.full_name}
            onChange={handleChange}
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.full_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={address.email}
            onChange={handleChange}
            autoComplete="email"
            inputMode="email"
            autoCorrect="off"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            autoComplete="tel"
            inputMode="tel"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+44 123 456 7890"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Address basics: Line1 + Postcode, with optional Line2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="md:col-span-2">
          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={address.address_line1}
            onChange={handleChange}
            autoComplete="address-line1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.address_line1 ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Street address, house number"
          />
          {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
          {!showLine2 ? (
            <button type="button" onClick={() => setShowLine2(true)} className="text-xs text-indigo-600 mt-1">
              + Add apartment/suite
            </button>
          ) : (
            <div className="mt-2">
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                value={address.address_line2}
                onChange={handleChange}
                autoComplete="address-line2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Apartment, suite, unit, etc."
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            Postcode *
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={address.postal_code}
            onChange={handleChange}
            autoComplete="postal-code"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.postal_code ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g. SW1A 1AA"
          />
          {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
        </div>
      </div>

      {/* Auto-filled details (read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            autoComplete="address-level2"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
            placeholder=""
            readOnly
          />
        </div>
        <div>
          <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
            County
          </label>
          <input
            type="text"
            id="county"
            name="county"
            value={address.county}
            onChange={handleChange}
            autoComplete="address-level1"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
            placeholder=""
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value="United Kingdom"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
            readOnly
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Guest Checkout:</span> You're checking out as a guest. 
          Your order confirmation will be sent to the email address provided above.
        </p>
      </div>
    </div>
  )
}
