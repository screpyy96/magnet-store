import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    console.log('Upload endpoint called')
    
    // Check if request is FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    let imageBuffer
    let fileName
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData upload (new method)
      const formData = await request.formData()
      const file = formData.get('file')
      
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: 'Missing or invalid file' }, 
          { status: 400 }
        )
      }
      
      // Check file size (max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.` }, 
          { status: 413 }
        )
      }
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
      
      // Validate buffer size
      if (imageBuffer.length === 0) {
        return NextResponse.json(
          { error: 'Empty file received' }, 
          { status: 400 }
        )
      }
      
      fileName = `magnet_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
      
      console.log(`Processing file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB`)
      
    } else {
      // Handle JSON base64 upload (legacy method)
      let requestData
      try {
        requestData = await request.json()
      } catch (error) {
        console.error('Failed to parse request JSON:', error)
        return NextResponse.json(
          { error: 'Invalid request data' }, 
          { status: 400 }
        )
      }
      
      const { base64Data, userId } = requestData
      
      console.log('Received request with userId:', userId)
      console.log('base64Data exists:', !!base64Data)
      
      if (!base64Data || typeof base64Data !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid image data' }, 
          { status: 400 }
        )
      }
      
      // Process base64 data
      const parts = base64Data.split(',')
      const base64Content = parts[1] || parts[0]
      
      if (!base64Content) {
        return NextResponse.json(
          { error: 'Invalid base64 content' }, 
          { status: 400 }
        )
      }
      
      imageBuffer = Buffer.from(base64Content, 'base64')
      fileName = `magnet_${Date.now()}.jpg`
    }
    
    if (!imageBuffer || imageBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty image data' }, 
        { status: 400 }
      )
    }
    
    // Verificăm dacă avem credențialele necesare pentru Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_SERVICE_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      })
      return NextResponse.json(
        { error: 'Server configuration error - missing credentials' }, 
        { status: 500 }
      )
    }
    
    // Creăm clientul Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log(`Uploading image "${fileName}" to Supabase bucket: magnet-images`)
    
    // Încărcăm imaginea în bucket
    try {
      const { error } = await supabase
        .storage
        .from('magnet-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json(
          { error: `Failed to upload image: ${error.message}` }, 
          { status: 500 }
        )
      }
      
      // Obținem URL-ul public
      const { data: urlData } = supabase
        .storage
        .from('magnet-images')
        .getPublicUrl(fileName)
      
      if (!urlData || !urlData.publicUrl) {
        return NextResponse.json(
          { error: 'Failed to get public URL' }, 
          { status: 500 }
        )
      }
      
      console.log('Upload successful, URL:', urlData.publicUrl)
      
      // Returnăm URL-ul public
      return NextResponse.json({ url: urlData.publicUrl })
    } catch (uploadError) {
      console.error('Unexpected error during upload:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Unexpected error during upload' }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Server error during upload:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' }, 
      { status: 500 }
    )
  }
} 