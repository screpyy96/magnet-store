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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl flex flex-col h-[90vh]">
        <div className="flex-none">
          <h3 className="text-lg font-semibold mb-2">Position Your Image</h3>
          <p className="text-sm text-gray-600 mb-4">
            Move the image to position it within the 5x5 cm square area.
          </p>
        </div>
        
        <div className="flex-1 min-h-0 relative mb-4">
          <div className="absolute inset-0 flex items-center justify-center overflow-auto">
            <div className="relative" style={{ maxHeight: '100%', maxWidth: '100%' }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                locked
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop me"
                  style={{
                    maxHeight: 'calc(80vh - 200px)',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </ReactCrop>
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="flex-none mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <img 
                  src={previewUrl} 
                  alt="Square preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-none flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!completedCrop}
            className={`px-4 py-2  ${
              completedCrop 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
} 