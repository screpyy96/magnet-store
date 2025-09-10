'use client'

import { useEffect, useRef, useState } from 'react'

// Lightweight Google Places Autocomplete wrapper for UK addresses
// Requires: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export default function AddressAutocomplete({ onSelect, placeholder = 'Start typing your address or postcode (UK only)...' }) {
  const inputRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Address autocomplete unavailable (missing Google Maps API key).')
      return
    }

    // Load script once
    if (typeof window !== 'undefined' && !window._gmapsPlacesLoading) {
      window._gmapsPlacesLoading = true
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=GB`;
      s.async = true
      s.defer = true
      s.onload = () => setLoaded(true)
      s.onerror = () => setError('Failed to load Google Maps script')
      document.head.appendChild(s)
    } else if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: ['gb'] },
      fields: ['address_components', 'formatted_address'],
      types: ['address']
    })

    const handler = () => {
      const place = autocomplete.getPlace()
      if (!place || !place.address_components) return

      const get = (type) => place.address_components.find(c => c.types.includes(type))?.long_name || ''
      const getShort = (type) => place.address_components.find(c => c.types.includes(type))?.short_name || ''

      const postal_code = get('postal_code')
      const country = getShort('country') === 'GB' ? 'United Kingdom' : get('country')
      const city = get('postal_town') || get('locality') || ''
      const county = get('administrative_area_level_2') || get('administrative_area_level_1') || ''
      const line1 = [get('street_number'), get('route')].filter(Boolean).join(' ')

      const address = {
        full_name: '',
        email: '',
        phone: '',
        address_line1: line1,
        address_line2: '',
        city,
        county,
        postal_code,
        country,
      }

      onSelect?.(address)
    }

    autocomplete.addListener('place_changed', handler)
    return () => window.google?.maps?.event?.clearInstanceListeners?.(autocomplete)
  }, [loaded, onSelect])

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Find your address (UK)</label>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
      />
      {error && <p className="text-xs text-gray-500 mt-1">{error}</p>}
      {!error && !loaded && <p className="text-xs text-gray-400 mt-1">Loading autocomplete…</p>}
    </div>
  )
}

