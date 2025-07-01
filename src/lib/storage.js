import { createClient } from './supabase'

const supabase = createClient()

export const uploadMagnetImage = async (file, userId, orderId = null) => {
  try {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    
    // Create folder structure: userId/orderId or userId/custom for custom magnets
    const folder = orderId ? `${userId}/${orderId}` : `${userId}/custom`
    const fileName = `${folder}/${timestamp}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('magnet-orders')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return fileName
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

export const uploadCustomMagnetBlob = async (blob, userId) => {
  try {
    const timestamp = Date.now()
    const fileName = `${userId}/custom/${timestamp}.png`
    
    const { data, error } = await supabase.storage
      .from('magnet-orders')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error
    return fileName
  } catch (error) {
    throw new Error(`Failed to upload custom magnet: ${error.message}`)
  }
}

export const getMagnetImageUrl = (path) => {
  try {
    const { data } = supabase.storage
      .from('magnet-orders')
      .getPublicUrl(path)
    
    return data.publicUrl
  } catch (error) {
    console.error('Error getting image URL:', error)
    return null
  }
}

export const deleteMagnetImage = async (path) => {
  try {
    const { error } = await supabase.storage
      .from('magnet-orders')
      .remove([path])
    
    if (error) throw error
    return true
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}