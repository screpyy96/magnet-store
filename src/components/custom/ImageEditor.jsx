"use client"

import { useState, useCallback, useEffect } from "react"
import Cropper from "react-easy-crop"

export default function ImageEditor({ file, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imageSrc, setImageSrc] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load image when file changes
  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener("load", () => setImageSrc(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }, [file])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return null

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas size to 500x500 for consistent magnet size
      const size = 500
      canvas.width = size
      canvas.height = size
      
      // Create image
      const image = new Image()
      image.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = imageSrc
      })

      // Clear canvas
      ctx.clearRect(0, 0, size, size)
      
      // Apply rotation
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // Draw the cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        -size / 2,
        -size / 2,
        size,
        size
      )
      
      ctx.restore()
      
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (e) {
      return null
    }
  }, [imageSrc, croppedAreaPixels, rotation])

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const croppedImageBase64 = await createCroppedImage()
      
      if (!croppedImageBase64) {
        throw new Error('Could not process image')
      }
      
      // Convert base64 to Blob
      const fetchRes = await fetch(croppedImageBase64)
      const blob = await fetchRes.blob()
      
      // Call the save function from parent
      await onSave(blob)
      
    } catch (error) {
      setError(error.message || 'Failed to save image')
    } finally {
      setLoading(false)
    }
  }

  const resetControls = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Position Your Image</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Cropper Area */}
          <div className="flex-1 relative bg-gray-100 min-h-64 lg:min-h-0">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                rotation={rotation}
                onRotationChange={setRotation}
                showGrid={true}
                objectFit="contain"
              />
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
            {/* Controls Content */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
              {/* Instructions */}
              <div>
                <p className="text-sm text-gray-600 mb-4">Move and resize the image to fit your magnet.</p>
                
                {/* Reset Button */}
                <button
                  onClick={resetControls}
                  className="w-full mb-6 px-3 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Reset Position
                </button>
              </div>

              {/* Zoom Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Zoom</span>
                  <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Rotation Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Rotate</span>
                  <span className="text-sm text-gray-500">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #f97316);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #f97316);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}

