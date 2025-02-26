const express = require('express');
const router = express.Router();
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to convert base64 to buffer
const base64ToBuffer = (base64) => {
  const base64Data = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * POST /api/pdf/merge-images
 * Merges images onto a PDF at specified coordinates
 * 
 * Request body should contain:
 * - pdf: Original PDF file
 * - overlays: Array of objects containing:
 *   - imageData: Base64 encoded image
 *   - x: X coordinate
 *   - y: Y coordinate
 *   - width: Image width
 *   - height: Image height
 *   - page: Page number (0-based)
 */
router.post('/merge-images', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const overlays = JSON.parse(req.body.overlays || '[]');
    if (!Array.isArray(overlays)) {
      return res.status(400).json({ error: 'Invalid overlays format' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const chunks = [];

    // Collect chunks
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="edited.pdf"');
      res.send(result);
    });

    // Load the original PDF
    const originalPdf = req.file.buffer;
    
    // Add each page from the original PDF
    // Note: This is a simplified version. In practice, you'd need to use pdf-parse
    // or similar to get the original PDF's page count and dimensions
    doc.addPage();

    // Process each overlay
    for (const overlay of overlays) {
      const { imageData, x, y, width, height, page } = overlay;
      
      // If this overlay is for a different page, add a new page
      if (page > 0) {
        doc.addPage();
      }

      // Convert base64 image to buffer
      const imageBuffer = base64ToBuffer(imageData);

      // Add the image at the specified coordinates
      doc.image(imageBuffer, x, y, {
        width: width,
        height: height
      });
    }

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

module.exports = router;
