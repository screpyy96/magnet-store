"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Cropper from "react-easy-crop"

export default function ImageEditor({ file, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imageSrc, setImageSrc] = useState("")
  const [showTextControls, setShowTextControls] = useState(false)
  const [text, setText] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [textSize, setTextSize] = useState(24)
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Definim referința lipsă
  const imageRef = useRef(null)

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
      
      // Add text if it exists
      if (text) {
        // Restore context for text (without rotation)
        ctx.restore()
        ctx.save()
        
        // Configure the font
        ctx.font = `bold ${textSize}px Arial, sans-serif`
        ctx.fillStyle = textColor
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        
        // Calculate position based on percentage
        const xPos = (textPosition.x / 100) * canvas.width
        const yPos = (textPosition.y / 100) * canvas.height
        
        // Add stroke/outline effect to make text more visible
        ctx.strokeStyle = textColor === "#ffffff" ? "#000000" : "#ffffff"
        ctx.lineWidth = 2
        ctx.strokeText(text, xPos, yPos)
        ctx.fillText(text, xPos, yPos)
      }
      
      // Restore context
      ctx.restore()
      
      // Convert to base64 string directly - MODIFIED (canvas.toDataURL doesn't accept callback)
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (e) {
      console.error("Error creating cropped image:", e)
      return null
    }
  }, [imageSrc, croppedAreaPixels, rotation, text, textColor, textSize, textPosition])

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use createCroppedImage instead of relying on imageRef
      const croppedImageBase64 = await createCroppedImage()
      
      if (!croppedImageBase64) {
        throw new Error('Could not process image')
      }
      
      // Convert base64 to Blob
      const fetchRes = await fetch(croppedImageBase64)
      const blob = await fetchRes.blob()
      
      // Call the save function from parent
      const imageUrl = await onSave(blob)
      console.log('Image saved successfully:', imageUrl)
      
    } catch (error) {
      console.error('Error in handleSave:', error)
      setError(error.message || 'Failed to save image')
    } finally {
      setLoading(false)
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
        {/* Header - mai compact pe mobile */}
        <div className="flex items-center justify-between p-2 sm:p-4 bg-white">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onCancel}
              className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-gray-900 text-sm sm:text-base font-medium">Position Your Image</h2>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-400 to-amber-400 hover:from-pink-500 hover:to-amber-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-medium flex items-center gap-1 sm:gap-2 transition-all"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save</span>
          </button>
        </div>

        {/* Main Content - păstrăm așa cum este pentru a asigura o zonă de editare adecvată */}
        <div className="flex-1 relative bg-gray-100">
          <div className="absolute inset-0">
            {imageSrc && (
              <>
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
                
                {/* Overlay pentru text */}
                {text && showTextControls && (
                  <div 
                    className="absolute pointer-events-none"
                    style={{
                      top: `${textPosition.y}%`,
                      left: `${textPosition.x}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${textSize}px`,
                      color: textColor,
                      fontWeight: 'bold',
                      // Adăugăm un efect de text-shadow pentru vizibilitate
                      textShadow: textColor === "#ffffff" ? 
                        '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black' :
                        '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white',
                      zIndex: 50,
                    }}
                  >
                    {text}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls - adăugăm tab-uri pentru controale */}
        <div className="bg-white p-2 sm:p-4 space-y-2 sm:space-y-4">
          {/* Tabs pentru diferite controale */}
          <div className="flex border-b mb-2">
            <button 
              onClick={() => setShowTextControls(false)}
              className={`px-3 py-2 text-sm font-medium ${!showTextControls ? 'border-b-2 border-pink-400 text-pink-600' : 'text-gray-600'}`}
            >
              Image
            </button>
            <button 
              onClick={() => setShowTextControls(true)}
              className={`px-3 py-2 text-sm font-medium ${showTextControls ? 'border-b-2 border-pink-400 text-pink-600' : 'text-gray-600'}`}
            >
              Add Text
            </button>
          </div>

          {/* Se afișează controalele existente sau cele pentru text */}
          {!showTextControls ? (
            // Controalele existente pentru imagine
            <>
              {/* Text și buton Reset - mai compacte și reorganizate */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-0">
                  Move and resize the image.
                </p>
                <button
                  onClick={resetControls}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm self-end"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>

              {/* Control sliders - mai compacte și optimizate pentru mobile */}
              <div className="grid grid-cols-1 gap-2 sm:gap-6">
                {/* Zoom Control */}
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <span>Zoom</span>
                    </label>
                    <span className="text-gray-500 text-xs sm:text-sm">{zoom.toFixed(1)}x</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div 
                      className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1.5 sm:h-2 bg-gradient-to-r from-pink-400 to-amber-400 rounded-l-lg pointer-events-none" 
                      style={{ width: `${((zoom - 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rotation Control */}
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Rotate</span>
                    </label>
                    <span className="text-gray-500 text-xs sm:text-sm">{rotation}°</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1.5 sm:h-2 bg-gradient-to-r from-pink-400 to-amber-400 rounded-lg pointer-events-none" 
                      style={{ 
                        width: `${Math.abs(rotation) / 1.8}%`,
                        left: rotation < 0 ? `${50 - Math.abs(rotation) / 3.6}%` : '50%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Controale pentru text
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-8 w-8 rounded border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">{textColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Size</label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">{textSize}px</span>
              </div>

              {/* Adăugăm controale pentru poziția textului */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Position</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Horizontal</span>
                      <span className="text-xs text-gray-500">{textPosition.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={textPosition.x}
                      onChange={(e) => setTextPosition({...textPosition, x: Number(e.target.value)})}
                      className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Vertical</span>
                      <span className="text-xs text-gray-500">{textPosition.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={textPosition.y}
                      onChange={(e) => setTextPosition({...textPosition, y: Number(e.target.value)})}
                      className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Exemplu de conversie Blob -> base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

