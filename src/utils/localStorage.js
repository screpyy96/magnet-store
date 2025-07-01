// Safe localStorage utilities that work in SSR environments

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
      // Handle quota exceeded or other storage errors
      try {
        // Try to clear some space and retry
        localStorage.clear();
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        return false;
      }
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

  // Set JSON safely
  setJSON: (key, value) => {
    try {
      return safeLocalStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return false;
    }
  }
};

// Legacy exports for backwards compatibility
export const getItem = safeLocalStorage.getItem;
export const setItem = safeLocalStorage.setItem;
export const removeItem = safeLocalStorage.removeItem; 