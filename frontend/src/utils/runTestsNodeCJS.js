/**
 * Node.js script to run localStorage tests (CommonJS version)
 * 
 * This script simulates the browser localStorage API in Node.js
 * to allow testing the localStorage utility functions.
 * 
 * Run with: node runTestsNodeCJS.js
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  _data: {},
  setItem: function(id, val) {
    this._data[id] = String(val);
  },
  getItem: function(id) {
    return this._data[id] || null;
  },
  removeItem: function(id) {
    delete this._data[id];
  },
  clear: function() {
    this._data = {};
  }
};

// Define storage keys (same as in localStorage.js)
const STORAGE_KEYS = {
  DOCUMENTS: 'pdfsigno_documents',
  RECENT_IMAGES: 'pdfsigno_recent_images',
  USER_PREFERENCES: 'pdfsigno_preferences',
  RECENT_TEMPLATES: 'pdfsigno_templates'
};

// Helper functions for local storage operations
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
};

// Document-specific functions
const saveDocument = (document) => {
  const documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  
  // Check if document with the same ID already exists
  const existingDocIndex = documents.findIndex(doc => doc.id === document.id);
  
  if (existingDocIndex !== -1) {
    // Update existing document
    documents[existingDocIndex] = document;
  } else {
    // Add new document
    documents.push(document);
  }
  
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
};

const deleteDocument = (documentId) => {
  const documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  const updatedDocuments = documents.filter(doc => doc.id !== documentId);
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, updatedDocuments);
};

// Image-specific functions
const saveImage = (image) => {
  const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  
  // Check if image with the same ID already exists
  const existingImgIndex = images.findIndex(img => img.id === image.id);
  
  if (existingImgIndex !== -1) {
    // Update existing image
    images[existingImgIndex] = image;
  } else {
    // Add new image
    images.push(image);
  }
  
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, images);
};

const deleteImage = (imageId) => {
  const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  const updatedImages = images.filter(img => img.id !== imageId);
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, updatedImages);
};

// Clear all functions
const clearAllDocuments = () => {
  return saveToStorage(STORAGE_KEYS.DOCUMENTS, []);
};

const clearAllImages = () => {
  return saveToStorage(STORAGE_KEYS.RECENT_IMAGES, []);
};

/**
 * Test document saving and duplicate prevention
 */
const testDocumentSaving = () => {
  console.log('\n--- Testing Document Saving ---');
  
  // Create test document
  const testDoc1 = {
    id: 'doc-123',
    name: 'Test Document 1',
    url: 'blob:test-url-1',
    type: 'application/pdf',
    timestamp: new Date().toISOString()
  };
  
  // Save document
  console.log('Saving document for the first time...');
  saveDocument(testDoc1);
  
  // Check if document was saved
  let documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after first save: ${documents.length}`);
  console.log(documents);
  
  // Save the same document again (should update, not duplicate)
  console.log('\nSaving the same document again...');
  saveDocument(testDoc1);
  
  // Check if document was duplicated
  documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after second save: ${documents.length}`);
  console.log(documents);
  
  // Save a modified version of the same document (should update)
  const updatedDoc1 = {
    ...testDoc1,
    name: 'Updated Test Document 1'
  };
  
  console.log('\nSaving updated version of the same document...');
  saveDocument(updatedDoc1);
  
  // Check if document was updated
  documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after update: ${documents.length}`);
  console.log(documents);
  
  // Save a new document (should add)
  const testDoc2 = {
    id: 'doc-456',
    name: 'Test Document 2',
    url: 'blob:test-url-2',
    type: 'application/pdf',
    timestamp: new Date().toISOString()
  };
  
  console.log('\nSaving a different document...');
  saveDocument(testDoc2);
  
  // Check if new document was added
  documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after adding new document: ${documents.length}`);
  console.log(documents);
  
  return documents;
};

/**
 * Test image saving and duplicate prevention
 */
const testImageSaving = () => {
  console.log('\n--- Testing Image Saving ---');
  
  // Create test image
  const testImg1 = {
    id: 'img-123',
    name: 'Test Image 1',
    url: 'blob:test-image-url-1',
    type: 'image/png',
    timestamp: new Date().toISOString()
  };
  
  // Save image
  console.log('Saving image for the first time...');
  saveImage(testImg1);
  
  // Check if image was saved
  let images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  console.log(`Images after first save: ${images.length}`);
  console.log(images);
  
  // Save the same image again (should update, not duplicate)
  console.log('\nSaving the same image again...');
  saveImage(testImg1);
  
  // Check if image was duplicated
  images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  console.log(`Images after second save: ${images.length}`);
  console.log(images);
  
  // Save a modified version of the same image (should update)
  const updatedImg1 = {
    ...testImg1,
    name: 'Updated Test Image 1'
  };
  
  console.log('\nSaving updated version of the same image...');
  saveImage(updatedImg1);
  
  // Check if image was updated
  images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  console.log(`Images after update: ${images.length}`);
  console.log(images);
  
  // Save a new image (should add)
  const testImg2 = {
    id: 'img-456',
    name: 'Test Image 2',
    url: 'blob:test-image-url-2',
    type: 'image/jpeg',
    timestamp: new Date().toISOString()
  };
  
  console.log('\nSaving a different image...');
  saveImage(testImg2);
  
  // Check if new image was added
  images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
  console.log(`Images after adding new image: ${images.length}`);
  console.log(images);
  
  return images;
};

/**
 * Test the PDFPreview component's interaction with localStorage
 */
const testPDFPreviewSaving = () => {
  console.log('\n--- Testing PDFPreview Document Saving ---');
  
  // Create document objects with the same ID but different timestamps
  const doc1 = {
    id: 'pdf-test-123',
    name: 'Test PDF 1',
    url: 'blob:test-url-pdf-1',
    type: 'application/pdf',
    timestamp: new Date().toISOString()
  };
  
  // Save the document
  console.log('Saving PDF document...');
  saveDocument(doc1);
  
  // Check storage
  let documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after first save: ${documents.length}`);
  
  // Save again with same ID but updated timestamp
  const doc2 = {
    ...doc1,
    timestamp: new Date().toISOString()
  };
  
  console.log('Saving the same PDF document again...');
  saveDocument(doc2);
  
  // Check if document was duplicated
  documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after second save: ${documents.length}`);
  
  return documents;
};

/**
 * Run all tests
 */
const runAllTests = () => {
  console.log('=== Starting localStorage Tests ===');
  
  // Clear any existing data
  clearAllDocuments();
  clearAllImages();
  
  // Test document saving and duplicate prevention
  const documents = testDocumentSaving();
  
  // Test image saving and duplicate prevention
  const images = testImageSaving();
  
  // Test PDFPreview interaction (after the main tests)
  testPDFPreviewSaving();
  
  console.log('=== All Tests Completed ===');
  
  return { documents, images };
};

// Run all tests
runAllTests();
