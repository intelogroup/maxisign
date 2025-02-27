/**
 * File utility functions for MaxiSign
 */

/**
 * Convert a file to a data URL
 * 
 * @param {File} file - File to convert
 * @returns {Promise<string>} Data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a data URL to a file
 * 
 * @param {string} dataURL - Data URL to convert
 * @param {string} filename - Name for the file
 * @param {string} type - MIME type for the file
 * @returns {File} File object
 */
export const dataURLToFile = (dataURL, filename, type = 'image/png') => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: type || mime });
};

/**
 * Get file extension
 * 
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Format file size
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Validate file type
 * 
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} Whether the file type is allowed
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * 
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} Whether the file size is allowed
 */
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Download a file
 * 
 * @param {string} url - URL to download
 * @param {string} filename - Name for the downloaded file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create a file from a blob
 * 
 * @param {Blob} blob - Blob to convert
 * @param {string} filename - Name for the file
 * @param {string} type - MIME type for the file
 * @returns {File} File object
 */
export const blobToFile = (blob, filename, type) => {
  return new File([blob], filename, { type: type || blob.type });
};

export default {
  fileToDataURL,
  dataURLToFile,
  getFileExtension,
  formatFileSize,
  validateFileType,
  validateFileSize,
  downloadFile,
  blobToFile
};
