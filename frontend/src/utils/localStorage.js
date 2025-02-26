// Local storage keys
const PREFIX = process.env.REACT_APP_STORAGE_PREFIX || 'pdfsigno_';

export const STORAGE_KEYS = {
  DOCUMENTS: `${PREFIX}documents`,
  RECENT_IMAGES: `${PREFIX}recent_images`,
  USER_PREFERENCES: `${PREFIX}preferences`,
  RECENT_TEMPLATES: `${PREFIX}templates`
};

// Storage availability check
export const checkStorageAvailability = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return { available: true, size: estimateStorageSize() };
  } catch (e) {
    return {
      available: false,
      error: e,
      reason: e.name === 'QuotaExceededError' ? 'quota_exceeded' : 'storage_not_available'
    };
  }
};

// Estimate current storage usage
export const estimateStorageSize = () => {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length * 2; // UTF-16 uses 2 bytes per character
    }
  }
  return totalSize;
};

// Helper functions for local storage operations
export const getFromStorage = (key, defaultValue = []) => {
  try {
    const storageCheck = checkStorageAvailability();
    if (!storageCheck.available) {
      console.warn('localStorage is not available:', storageCheck.reason);
      return defaultValue;
    }
    
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

export const saveToStorage = (key, data) => {
  try {
    const storageCheck = checkStorageAvailability();
    if (!storageCheck.available) {
      throw new Error(`localStorage is not available: ${storageCheck.reason}`);
    }

    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Attempting cleanup...');
      // Try to free up space by removing old items
      const success = cleanupStorage();
      if (success) {
        // Retry saving after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (retryError) {
          console.error('Failed to save even after cleanup');
        }
      }
    }
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
};

// Cleanup old storage items
const cleanupStorage = () => {
  try {
    // Remove items older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const docs = getFromStorage(STORAGE_KEYS.DOCUMENTS, []);
    const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES, []);

    const filteredDocs = docs.filter(doc => new Date(doc.timestamp) > thirtyDaysAgo);
    const filteredImages = images.filter(img => new Date(img.timestamp) > thirtyDaysAgo);

    saveToStorage(STORAGE_KEYS.DOCUMENTS, filteredDocs);
    saveToStorage(STORAGE_KEYS.RECENT_IMAGES, filteredImages);

    return true;
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
};

// Document-specific functions with error handling
export const saveDocument = (document) => {
  const documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  const existingDocIndex = documents.findIndex(doc => doc.id === document.id);
  
  if (existingDocIndex !== -1) {
    documents[existingDocIndex] = document;
  } else {
    documents.unshift(document);
  }
  
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
};

export const deleteDocument = (documentId) => {
  const documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  const newDocuments = documents.filter(doc => doc.id !== documentId);
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, newDocuments);
};

// Image-specific functions with error handling
export const saveImage = (image) => {
  const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  const existingImageIndex = images.findIndex(img => img.id === image.id);
  
  if (existingImageIndex !== -1) {
    images[existingImageIndex] = image;
  } else {
    images.unshift(image);
  }
  
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, images);
};

export const deleteImage = (imageId) => {
  const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  const newImages = images.filter(img => img.id !== imageId);
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, newImages);
};

// Data export/import functions
export const exportUserData = () => {
  try {
    const data = {
      documents: getFromStorage(STORAGE_KEYS.DOCUMENTS),
      images: getFromStorage(STORAGE_KEYS.RECENT_IMAGES),
      preferences: getFromStorage(STORAGE_KEYS.USER_PREFERENCES),
      version: process.env.REACT_APP_VERSION || '1.0.0',
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `pdfsigno-data-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

export const importUserData = (jsonFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Version check and data validation could be added here
        if (data.documents) saveToStorage(STORAGE_KEYS.DOCUMENTS, data.documents);
        if (data.images) saveToStorage(STORAGE_KEYS.RECENT_IMAGES, data.images);
        if (data.preferences) saveToStorage(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
        
        resolve(true);
      } catch (error) {
        console.error('Error parsing imported data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(jsonFile);
  });
};

// Clear all functions with confirmation
export const clearAllDocuments = () => {
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, []);
};

export const clearAllImages = () => {
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, []);
};

// User preferences functions
export const saveUserPreferences = (preferences) => {
  const currentPreferences = getUserPreferences();
  const updatedPreferences = { ...currentPreferences, ...preferences };
  return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
};

export const getUserPreferences = () => {
  return getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {});
};

// Add CommonJS module.exports for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    getFromStorage,
    saveToStorage,
    removeFromStorage,
    saveDocument,
    deleteDocument,
    saveImage,
    deleteImage,
    clearAllDocuments,
    clearAllImages,
    saveUserPreferences,
    getUserPreferences,
    checkStorageAvailability,
    estimateStorageSize,
    exportUserData,
    importUserData
  };
}
