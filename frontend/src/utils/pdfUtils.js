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
 * Client-side PDF image overlay using pdf-lib
 * @param {File} pdfFile - Original PDF file
 * @param {Array} overlays - Array of image overlays
 * @returns {Promise<Blob>} Modified PDF blob
 */
export const clientSidePDFWithOverlays = async (pdfFile, overlays) => {
  try {
    // Load the PDF document
    const pdfDoc = await loadPDFDocument(pdfFile);
    const pages = pdfDoc.getPages();
    
    // Process each overlay
    for (const overlay of overlays) {
      // Get the target page
      const pageIndex = overlay.page;
      if (pageIndex >= pages.length) {
        console.warn(`Page ${pageIndex + 1} does not exist in the document`);
        continue;
      }
      
      const page = pages[pageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Convert base64 image data to bytes
      const imageDataParts = overlay.imageData.split(',');
      const imageData = imageDataParts[1];
      const imageFormat = imageDataParts[0].includes('image/png') ? 'png' : 'jpeg';
      
      // Embed the image in the PDF
      let image;
      if (imageFormat === 'png') {
        image = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));
      } else {
        image = await pdfDoc.embedJpg(Buffer.from(imageData, 'base64'));
      }
      
      // Calculate position (convert from percentage to points)
      const x = (overlay.x / 100) * pageWidth;
      const y = pageHeight - ((overlay.y / 100) * pageHeight) - (overlay.height / 2);
      
      // Draw the image on the page
      page.drawImage(image, {
        x,
        y,
        width: overlay.width,
        height: overlay.height,
        rotate: overlay.rotation || 0,
        opacity: 1,
      });
    }
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error in client-side PDF processing:', error);
    throw new Error('Failed to process PDF: ' + error.message);
  }
};

/**
 * Save PDF with overlays
 * @param {File} pdfFile - Original PDF file
 * @param {Array} overlays - Array of image overlays
 * @returns {Promise<Blob>} Processed PDF blob
 */
export const savePDFWithOverlays = async (pdfFile, overlays) => {
  try {
    // Try client-side approach first
    return await clientSidePDFWithOverlays(pdfFile, overlays);
  } catch (error) {
    console.warn('Client-side PDF processing failed, falling back to server:', error);
    
    // Fallback to server-side approach
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
  }
};
