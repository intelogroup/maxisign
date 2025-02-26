/**
 * Convert an image file to base64 string
 * @param {File} file - Image file to convert
 * @returns {Promise<string>} Base64 string of the image
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get image dimensions while maintaining aspect ratio
 * @param {string} src - Image source URL
 * @param {number} maxWidth - Maximum width constraint
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export const getImageDimensions = (src, maxWidth = 200) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const width = Math.min(maxWidth, img.width);
      const height = width / aspectRatio;
      resolve({ width, height });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Calculate image position on canvas
 * @param {DOMRect} canvasRect - Canvas bounding rectangle
 * @param {MouseEvent} event - Mouse event
 * @param {number} scale - Canvas scale factor
 * @returns {{x: number, y: number}} Image position
 */
export const calculateImagePosition = (canvasRect, event, scale = 1) => {
  return {
    x: (event.clientX - canvasRect.left) / scale,
    y: (event.clientY - canvasRect.top) / scale
  };
};

/**
 * Process image for overlay
 * @param {File} file - Image file
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} page - Page number
 * @returns {Promise<Object>} Image overlay object
 */
export const processImageForOverlay = async (file, x, y, page) => {
  const imageData = await fileToBase64(file);
  const { width, height } = await getImageDimensions(URL.createObjectURL(file));
  
  return {
    imageData,
    x,
    y,
    width,
    height,
    page
  };
};
