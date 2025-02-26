/**
 * Test script for localStorage utility functions
 * This script tests the saveDocument and saveImage functions to ensure they don't create duplicates
 */

import { 
  getFromStorage, 
  saveDocument, 
  saveImage, 
  deleteDocument, 
  deleteImage,
  clearAllDocuments,
  clearAllImages,
  STORAGE_KEYS 
} from './localStorage';

// Mock localStorage for testing
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

// Install mock localStorage
global.localStorage = new LocalStorageMock();

// Test functions
const runTests = () => {
  console.log('=== Starting localStorage Tests ===');
  
  // Clear any existing data
  clearAllDocuments();
  clearAllImages();
  
  // Test document saving and duplicate prevention
  testDocumentSaving();
  
  // Test image saving and duplicate prevention
  testImageSaving();
  
  console.log('=== All Tests Completed ===');
};

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
  
  // Clean up
  clearAllDocuments();
};

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
  
  // Clean up
  clearAllImages();
};

// Run tests
runTests();

export default runTests;
