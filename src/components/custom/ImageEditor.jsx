"use client"

import { useState, useRef, useEffect } from "react"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

export default function ImageEditor({ file, onSave, onCancel }) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState(null)
  const [completedCrop, setCompletedCrop] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const imgRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })

  // Load image when file changes
  useEffect(() => {
    if (!file) return
    
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImgSrc(reader.result)
      
      // Set a simple initial crop
      setCrop({
        unit: "%",
        width: 50,
        height: 50,
        x: 25,
        y: 25
      })
    })
    reader.readAsDataURL(file)
  }, [file])

  // Track natural dimensions when image loads
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setNaturalSize({ width: naturalWidth, height: naturalHeight })
    imgRef.current = e.currentTarget
  }

  // Simple crop change handler
  const handleCropChange = (newCrop) => {
    setCrop(newCrop)
  }

  // Handle completed crop
  const handleComplete = (crop) => {
    setCompletedCrop(crop)
  }

  // Generate preview when crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current) return
    generatePreview()
  }, [completedCrop, scale, rotate])

  // Generate preview image
  const generatePreview = async () => {
    try {
      if (!completedCrop || !imgRef.current) return
      
      const croppedImg = await getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      )
      
      const url = URL.createObjectURL(croppedImg)
      setPreviewUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Failed to generate preview:", err)
    }
  }

  // Crop image function
  const getCroppedImg = async (image, crop, scale = 1, rotate = 0) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    
    if (!ctx) {
      throw new Error("No 2d context")
    }

    // We'll use the original image dimensions for calculation
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    // Device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1
    
    // Calculate dimensions for canvas based on crop and scale
    const cropWidth = crop.width * scaleX
    const cropHeight = crop.height * scaleY
    
    // Set canvas size to match the final cropped size
    canvas.width = cropWidth * pixelRatio
    canvas.height = cropHeight * pixelRatio
    
    // Scale context to account for pixel ratio
    ctx.scale(pixelRatio, pixelRatio)
    
    // Convert percent values to pixels if needed
    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY
    
    // Set background to white
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Apply transformations
    ctx.save()
    
    // Move the canvas origin to the center for rotation
    ctx.translate(cropWidth / 2, cropHeight / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-cropWidth / 2, -cropHeight / 2)
    
    // Draw the cropped image on the canvas
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    )
    
    // Restore context
    ctx.restore()
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"))
            return
          }
          resolve(blob)
        },
        "image/jpeg",
        0.95 // High quality
      )
    })
  }

  // Handle save action
  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return
    
    try {
      const croppedImg = await getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      )
      
      onSave(croppedImg)
    } catch (err) {
      console.error("Error saving image:", err)
    }
  }

  // Toggle mobile preview
  const toggleMobilePreview = () => {
    setShowMobilePreview(prev => !prev)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] overflow-hidden">
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-4 w-full max-w-5xl max-h-[90vh] flex flex-col relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Position Your Image</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Move and resize the image to create your square magnet. The image will be cropped to a perfect square.
          </p>

          {/* Preview toggle button for mobile */}
          {previewUrl && (
            <div className="md:hidden mb-3">
              <button 
                type="button"
                onClick={toggleMobilePreview}
                className="text-xs text-indigo-600 font-medium flex items-center"
              >
                {showMobilePreview ? 'Hide preview' : 'Show preview'}
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform ${showMobilePreview ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Preview for mobile - Shown only when toggled */}
          {previewUrl && showMobilePreview && (
            <div className="md:hidden bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white flex-none">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Preview</p>
                  <p className="text-xs text-gray-500">Your perfect square magnet</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center p-2 sm:p-4">
              {imgSrc && (
                <div className="relative crop-container" style={{ maxHeight: "60vh" }}>
                  <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleComplete}
                    aspect={1}
                    minWidth={50}
                    minHeight={50}
                    ruleOfThirds
                  >
                    <img
                      src={imgSrc}
                      alt="Crop me"
                      onLoad={onImageLoad}
                      style={{
                        maxHeight: "60vh",
                        maxWidth: "100%",
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        transformOrigin: "center",
                      }}
                    />
                  </ReactCrop>
                </div>
              )}
            </div>

            <div className="w-full lg:w-48 flex-none space-y-4">
              {/* Controls for zoom and rotate - visible on all screens */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex flex-row lg:flex-col gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zoom
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rotate
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotate}
                      onChange={(e) => setRotate(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Preview for desktop - always visible on larger screens */}
              {previewUrl && (
                <div className="hidden md:block bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4">
                    <div className="w-24 h-24 lg:w-full lg:h-32 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex-none">
                      <img 
                        src={previewUrl} 
                        alt="Square preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Your magnet will be perfectly square</p>
                      <p>Size: {completedCrop ? Math.round(completedCrop.width) : 0}%</p>
                      {naturalSize.width > 0 && (
                        <p className="text-gray-400">Original: {naturalSize.width}×{naturalSize.height}px</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex-1 md:flex-none"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!completedCrop}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium flex-1 md:flex-none ${
                completedCrop 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              type="button"
            >
              Save Magnet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

