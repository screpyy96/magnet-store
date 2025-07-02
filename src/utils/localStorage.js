// Safe localStorage utilities that work in SSR environments

const STORAGE_QUOTA_ERROR_MESSAGES = [
  'QuotaExceededError',
  'quota exceeded',
  'storage quota',
  'exceeded the quota'
];

const isQuotaError = (error) => {
  const message = (error.message || '').toLowerCase();
  return STORAGE_QUOTA_ERROR_MESSAGES.some(msg => message.includes(msg));
};

const clearOldData = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Clear old custom magnet images (keep only last 20)
    const customImages = JSON.parse(localStorage.getItem('customMagnetImages') || '[]');
    if (customImages.length > 20) {
      const recentImages = customImages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
      localStorage.setItem('customMagnetImages', JSON.stringify(recentImages));
    }

    // Clear other old data that might be taking up space
    const keysToCheck = ['persist:root'];
    for (const key of keysToCheck) {
      const item = localStorage.getItem(key);
      if (item && item.length > 1000000) { // If larger than 1MB
        try {
          const parsed = JSON.parse(item);
          if (parsed.cart && parsed.cart.items) {
            // Keep only essential cart data
            const cleanedCart = {
              ...parsed.cart,
              items: parsed.cart.items.slice(-10) // Keep only last 10 items
            };
            localStorage.setItem(key, JSON.stringify({ ...parsed, cart: cleanedCart }));
          }
        } catch (e) {
          // If we can't parse it, remove it
          localStorage.removeItem(key);
        }
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  setItem: (key, value) => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (isQuotaError(error)) {
        try {
          // Try to clear old data and retry
          clearOldData();
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          if (isQuotaError(retryError)) {
            // If still quota error, try more aggressive cleanup
            try {
              // Clear Redux persist data
              localStorage.removeItem('persist:root');
              
              // Clear old images except the most recent ones
              const customImages = JSON.parse(localStorage.getItem('customMagnetImages') || '[]');
              if (customImages.length > 0) {
                const recentImages = customImages
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 5); // Keep only 5 most recent
                localStorage.setItem('customMagnetImages', JSON.stringify(recentImages));
              }
              
              // Try one more time
              localStorage.setItem(key, value);
              return true;
            } catch (finalError) {
              console.warn('Unable to store data in localStorage due to quota limits:', finalError);
              return false;
            }
          }
          return false;
        }
      }
      return false;
    }
  },

  removeItem: (key) => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clear: () => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get parsed JSON safely
  getJSON: (key) => {
    const item = safeLocalStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (error) {
      return null;
    }
  },

  // Set JSON safely with size optimization for images
  setJSON: (key, value) => {
    try {
      let dataToStore = value;
      
      // Special handling for custom magnet images
      if (key === 'customMagnetImages' && Array.isArray(value)) {
        // Keep only the most recent 25 images to prevent quota issues
        dataToStore = value
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 25);
      }
      
      const success = safeLocalStorage.setItem(key, JSON.stringify(dataToStore));
      
      if (!success && key === 'customMagnetImages') {
        // If storing images failed, try with fewer images
        const reducedData = dataToStore.slice(0, 10);
        return safeLocalStorage.setItem(key, JSON.stringify(reducedData));
      }
      
      return success;
    } catch (error) {
      return false;
    }
  },

  // Get available storage space estimate
  getStorageInfo: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      return {
        used: totalSize,
        usedMB: (totalSize / (1024 * 1024)).toFixed(2),
        available: 'unknown' // Can't reliably determine quota
      };
    } catch (error) {
      return null;
    }
  }
};

// Utility function to get image for cart item
export const getCartItemImage = (item) => {
  // If image is directly available, use it
  if (item.image && item.image.length > 100) {
    return item.image;
  }
  if (item.fileData && item.fileData.length > 100) {
    return item.fileData;
  }
  if (item.image_url && item.image_url.length > 100) {
    return item.image_url;
  }

  // Try to get image from localStorage using timestamp
  try {
    const customData = JSON.parse(item.custom_data || '{}');
    const imageTimestamp = item.imageTimestamp || customData.imageTimestamp;
    
    if (imageTimestamp) {
      const customImages = safeLocalStorage.getJSON('customMagnetImages') || [];
      const matchingImage = customImages.find(img => img.timestamp === imageTimestamp);
      if (matchingImage) {
        return matchingImage.thumbnail;
      }
    }
  } catch (e) {
    // If parsing fails, fall through to default
  }

  // Return null if no image found
  return null;
};

// Utility function to cleanup old images when quota is reached
export const cleanupImageStorage = () => {
  try {
    const customImages = safeLocalStorage.getJSON('customMagnetImages') || [];
    if (customImages.length > 0) {
      // Keep only the 10 most recent images
      const recentImages = customImages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      safeLocalStorage.setJSON('customMagnetImages', recentImages);
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

// Legacy exports for backwards compatibility
export const getItem = safeLocalStorage.getItem;
export const setItem = safeLocalStorage.setItem;
export const removeItem = safeLocalStorage.removeItem; 