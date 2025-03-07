"use client"

import { useState, useCallback, useEffect } from "react"
import Cropper from "react-easy-crop"

export default function ImageEditor({ file, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imageSrc, setImageSrc] = useState("")

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

  // Completely revised function to create the cropped image
  const createCroppedImage = useCallback(async () => {
    try {
      if (!croppedAreaPixels) return null
      
      const image = new Image()
      image.src = imageSrc
      
      await new Promise((resolve) => {
        image.onload = resolve
      })

      // Create a canvas with fixed square dimensions
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        throw new Error("No 2d context")
      }

      // Fixed size for output - always square
      const outputSize = 800
      canvas.width = outputSize
      canvas.height = outputSize
      
      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Save context state
      ctx.save()
      
      // Move to center of canvas for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // Calculate scale to fit the cropped area
      const scale = Math.min(
        outputSize / croppedAreaPixels.width,
        outputSize / croppedAreaPixels.height
      )
      
      // Draw the image centered and scaled
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        -outputSize / 2,
        -outputSize / 2,
        outputSize,
        outputSize
      )
      
      // Restore context
      ctx.restore()
      
      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Failed to create blob")
              resolve(null)
              return
            }
            resolve(blob)
          },
          "image/jpeg",
          0.95 // High quality
        )
      })
    } catch (e) {
      console.error("Error creating cropped image:", e)
      return null
    }
  }, [imageSrc, croppedAreaPixels, rotation])

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return
      const croppedImage = await createCroppedImage()
      if (croppedImage) {
        onSave(croppedImage)
      }
    } catch (e) {
      console.error("Error saving image:", e)
    }
  }

  const resetControls = () => {
    setZoom(1)
    setRotation(0)
    setCrop({ x: 0, y: 0 })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] overflow-hidden">
      <div className="h-screen w-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-gray-900 font-medium">Position Your Image</h2>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Magnet</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative bg-gray-100">
          <div className="absolute inset-0">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                objectFit="contain"
                classes={{
                  containerClassName: "!rounded-none",
                  cropAreaClassName: "!border-2 !border-white !rounded-none",
                  mediaClassName: "!rounded-none"
                }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Move and resize the image to create your square magnet.
            </p>
            <button
              onClick={resetControls}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span>Zoom</span>
                </label>
                <span className="text-gray-500 text-sm">{zoom.toFixed(1)}x</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-2 bg-gradient-to-r from-pink-400 to-amber-400 rounded-l-lg pointer-events-none" 
                  style={{ width: `${((zoom - 1) / 2) * 100}%` }}
                />
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Rotate</span>
                </label>
                <span className="text-gray-500 text-sm">{rotation}°</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-pink-400 to-amber-400 rounded-lg pointer-events-none" 
                  style={{ 
                    width: `${Math.abs(rotation) / 1.8}%`,
                    left: rotation < 0 ? `${50 - Math.abs(rotation) / 3.6}%` : '50%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

