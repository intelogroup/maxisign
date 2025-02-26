import { PDFDocument } from 'pdf-lib';

/**
 * Load a PDF file and return a PDFDocument instance
 * @param {File} file - PDF file to load
 * @returns {Promise<PDFDocument>} PDFDocument instance
 */
export const loadPDFDocument = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  return await PDFDocument.load(arrayBuffer);
};

/**
 * Render a PDF page to a canvas
 * @param {PDFPage} page - PDF page to render
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Object} viewport - Viewport dimensions
 * @param {number} scale - Scale factor
 */
export const renderPDFPage = async (page, context, viewport, scale = 1) => {
  const { width, height } = page.getSize();
  
  // Set canvas dimensions
  context.canvas.width = width * scale;
  context.canvas.height = height * scale;

  // Clear canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  // Draw page
  await page.drawPage(context, viewport);
};

/**
 * Draw image overlays on canvas
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Array} overlays - Array of image overlays
 * @param {number} currentPage - Current page number
 * @param {number} scale - Scale factor
 */
export const drawImageOverlays = async (context, overlays, currentPage, scale = 1) => {
  const pageOverlays = overlays.filter(overlay => overlay.page === currentPage - 1);
  
  for (const overlay of pageOverlays) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = overlay.imageData;
    });
    
    context.drawImage(
      img,
      overlay.x * scale,
      overlay.y * scale,
      overlay.width * scale,
      overlay.height * scale
    );
  }
};

/**
 * Save PDF with overlays
 * @param {File} pdfFile - Original PDF file
 * @param {Array} overlays - Array of image overlays
 * @returns {Promise<Blob>} Processed PDF blob
 */
export const savePDFWithOverlays = async (pdfFile, overlays) => {
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('overlays', JSON.stringify(overlays));

  const response = await fetch('http://localhost:3001/api/pdf/merge-images', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process PDF');
  }

  return await response.blob();
};
