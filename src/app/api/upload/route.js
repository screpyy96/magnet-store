import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Logging mai bun
    console.log('Upload endpoint called')
    
    // Obținem datele din request
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
    
    // Log pentru debugging
    console.log('Received request with userId:', userId)
    console.log('base64Data exists:', !!base64Data)
    console.log('base64Data type:', typeof base64Data)
    
    // Validarea datelor
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Missing image data' }, 
        { status: 400 }
      )
    }
    
    if (typeof base64Data !== 'string') {
      return NextResponse.json(
        { error: 'Image data must be a string' }, 
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
    
    // Procesăm datele imaginii
    let base64Content
    try {
      const parts = base64Data.split(',')
      base64Content = parts[1] || parts[0] // Dacă nu există separator, folosim întregul string
    } catch (error) {
      console.error('Failed to split base64 data:', error)
      return NextResponse.json(
        { error: 'Failed to process image data' }, 
        { status: 400 }
      )
    }
    
    if (!base64Content) {
      return NextResponse.json(
        { error: 'Invalid base64 content' }, 
        { status: 400 }
      )
    }
    
    // Creăm buffer-ul
    let imageBuffer
    try {
      imageBuffer = Buffer.from(base64Content, 'base64')
    } catch (error) {
      console.error('Failed to create buffer from base64:', error)
      return NextResponse.json(
        { error: 'Failed to process image buffer' }, 
        { status: 400 }
      )
    }
    
    if (imageBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty image data' }, 
        { status: 400 }
      )
    }
    
    // Generăm un nume de fișier unic
    const fileName = `magnet_${Date.now()}.jpg`
    
    console.log(`Uploading image "${fileName}" to Supabase bucket: magnet_images`)
    
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