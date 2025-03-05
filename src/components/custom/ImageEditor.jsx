'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function ImageEditor({ file, onSave, onCancel }) {
  // Fixed size for 5x5 cm magnet (converted to pixels at 96 DPI)
  const MAGNET_SIZE_PX = 189 // 5cm * 96px/inch * (1inch/2.54cm)
  
  const [crop, setCrop] = useState({
    unit: 'px',
    width: MAGNET_SIZE_PX,
    height: MAGNET_SIZE_PX,
    x: 0,
    y: 0
  })
  
  const [completedCrop, setCompletedCrop] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const imgRef = useRef(null)
  const [imgSrc, setImgSrc] = useState('')

  // Load image when file changes
  useEffect(() => {
    if (!file) return
    
    const reader = new FileReader()
    reader.addEventListener('load', () => setImgSrc(reader.result))
    reader.readAsDataURL(file)
  }, [file])

  // Generate preview when crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current) return

    const generatePreview = async () => {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop, false)
      const url = URL.createObjectURL(croppedImage)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }

    generatePreview()
  }, [completedCrop])

  const getCroppedImg = async (image, crop, shouldClip = true) => {
    const canvas = document.createElement('canvas')
    canvas.width = MAGNET_SIZE_PX
    canvas.height = MAGNET_SIZE_PX
    const ctx = canvas.getContext('2d')

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      MAGNET_SIZE_PX,
      MAGNET_SIZE_PX
    )

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        blob.name = file.name
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return
    const croppedImage = await getCroppedImg(imgRef.current, completedCrop)
    onSave(croppedImage)
  }

  if (!imgSrc) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-4 w-full max-w-lg relative">
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
          
          <p className="text-sm text-gray-500 mb-2">
            Move and resize the image to fit within the 5x5 cm square area.
          </p>

          <div className="bg-gray-50 rounded-xl p-2 mb-3">
            <div className="flex items-center justify-center" style={{ height: '280px' }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                locked
                className="rounded-lg overflow-hidden max-h-full"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop me"
                  className="max-h-[260px] w-auto object-contain"
                />
              </ReactCrop>
            </div>
          </div>

          {previewUrl && (
            <div className="bg-gray-50 rounded-xl p-2 mb-3">
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img 
                    src={previewUrl} 
                    alt="Square preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Final size: 5x5 cm</p>
                  <p>Resolution: {MAGNET_SIZE_PX}x{MAGNET_SIZE_PX}px</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!completedCrop}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                completedCrop 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save Magnet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 