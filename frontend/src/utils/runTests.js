/**
 * Test runner for localStorage functionality
 * This file can be imported in the browser console to test localStorage functionality
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

/**
 * Test document saving and duplicate prevention
 */
export const testDocumentSaving = () => {
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
export const testImageSaving = () => {
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
export const testPDFPreviewSaving = () => {
  console.log('\n--- Testing PDFPreview Document Saving ---');
  
  // Create a mock PDF file
  const mockPDFFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
  
  // Create a URL for the file
  const url = URL.createObjectURL(mockPDFFile);
  
  // Create document objects with the same ID but different timestamps
  const doc1 = {
    id: 'pdf-test-123',
    name: 'Test PDF 1',
    url: url,
    type: 'application/pdf',
    timestamp: new Date().toISOString()
  };
  
  // Save the document
  console.log('Saving PDF document...');
  saveDocument(doc1);
  
  // Check storage
  let documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
  console.log(`Documents after first save: ${documents.length}`);
  
  // Wait a second and save again with same ID but updated timestamp
  setTimeout(() => {
    const doc2 = {
      ...doc1,
      timestamp: new Date().toISOString()
    };
    
    console.log('Saving the same PDF document again...');
    saveDocument(doc2);
    
    // Check if document was duplicated
    documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
    console.log(`Documents after second save: ${documents.length}`);
    console.log(documents);
  }, 1000);
  
  return documents;
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log('=== Starting localStorage Tests ===');
  
  // Clear any existing data
  clearAllDocuments();
  clearAllImages();
  
  // Test document saving and duplicate prevention
  const documents = testDocumentSaving();
  
  // Test image saving and duplicate prevention
  const images = testImageSaving();
  
  // Test PDFPreview interaction
  testPDFPreviewSaving();
  
  console.log('=== All Tests Completed ===');
  
  return { documents, images };
};

export default {
  testDocumentSaving,
  testImageSaving,
  testPDFPreviewSaving,
  runAllTests
};
