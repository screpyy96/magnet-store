import { createClient } from '@supabase/supabase-js'

export async function testStorageAccess() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Testăm să listăm fișierele
    const { data: listData, error: listError } = await supabase
      .storage
      .from('magnet_images')
      .list()
    
    if (listError) {
      console.error('Error listing files:', listError)
      return false
    }
    
    console.log('Successfully listed files:', listData)
    
    // Testăm să încărcăm un fișier text simplu
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('magnet_images')
      .upload(`test_${Date.now()}.txt`, testFile)
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError)
      return false
    }
    
    console.log('Successfully uploaded test file:', uploadData)
    return true
  } catch (error) {
    console.error('Test storage access error:', error)
    return false
  }
} 