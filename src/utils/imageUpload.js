// Nu mai avem nevoie de importul supabase aici, 
// deoarece folosim endpoint-ul serverless
export async function uploadImage(base64Data, userId) {
  try {
    if (!base64Data) throw new Error('No image data provided')
    
    console.log('Starting upload process...')
    
    // Verificăm dacă base64Data este un string
    if (typeof base64Data !== 'string') {
      console.error('Invalid base64Data type:', typeof base64Data)
      
      // Verificăm dacă este un Blob și încercăm să-l convertim
      if (base64Data instanceof Blob || base64Data instanceof File) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Apelăm recursiv funcția, dar de data asta cu un string
            uploadImage(reader.result, userId)
              .then(resolve)
              .catch(reject);
          };
          reader.onerror = reject;
          reader.readAsDataURL(base64Data);
        });
      }
      
      throw new Error('Image data must be a string')
    }
    
    // Verificăm formatul datelor
    if (!base64Data.includes(',')) {
      console.error('Invalid base64 format - missing comma separator')
      throw new Error('Invalid image data format')
    }
    
    // Trimite datele la API-ul nostru serverless
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        base64Data, 
        userId: userId ? userId.toString() : null 
      })
    })
    
    // Verificăm răspunsul pentru erori HTTP
    if (!response.ok) {
      let errorMessage = `Upload failed with status: ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        console.error('Failed to parse error response:', e)
      }
      
      throw new Error(errorMessage)
    }
    
    // Parsăm răspunsul
    const data = await response.json()
    
    if (!data.url) {
      throw new Error('No URL returned from server')
    }
    
    console.log('Image uploaded successfully')
    return data.url
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
} 