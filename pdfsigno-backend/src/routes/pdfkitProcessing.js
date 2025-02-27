const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { PDFDocument: PDFLib } = require('pdf-lib');
const sharp = require('sharp');

const router = express.Router();

// Add font configuration
const fontConfig = {
  ZapfDingbats: require('pdfkit/js/data/ZapfDingbats.afm'),
  FoxitDingbats: fs.readFileSync(path.join(__dirname, '../../fonts/FoxitDingbats.pfb'))
};

/**
 * Apply effects to the image placement
 * @param {PDFDocument} doc - PDFKit document
 * @param {Object} effects - Effects configuration
 */
function applyEffects(doc, effects) {
  if (effects.shadow) {
    // Draw shadow first
    doc.save()
       .translate(effects.shadow.offsetX || 5, effects.shadow.offsetY || 5)
       .rect(0, 0, effects.width, effects.height)
       .fill(effects.shadow.color || '#00000033');
    doc.restore();
  }

  if (effects.border) {
    doc.rect(0, 0, effects.width, effects.height)
       .lineWidth(effects.border.width || 2)
       .stroke(effects.border.color || '#000000');
  }
}

/**
 * Convert base64 to file
 * @param {string} base64String - Base64 string to convert
 * @param {string} filename - Output filename
 * @returns {Promise<string>} Path to saved file
 */
async function base64ToFile(base64String, filename) {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }

  const data = Buffer.from(matches[2], 'base64');
  const filePath = path.join(__dirname, '../../tmp', filename);
  await fsPromises.writeFile(filePath, data);
  return filePath;
}

/**
 * Convert pixel coordinates to PDF points
 * @param {number} x - X coordinate in pixels
 * @param {number} y - Y coordinate in pixels
 * @param {number} pageWidth - PDF page width in points
 * @param {number} pageHeight - PDF page height in points
 * @returns {Object} Coordinates in PDF points
 */
function pixelsToPDFPoints(x, y, pageWidth, pageHeight) {
  return {
    x: (x * pageWidth) / 100,
    y: (y * pageHeight) / 100
  };
}

// PDF processing routes
router.post('/merge-images', async (req, res) => {
  const tempFiles = [];
  
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const pdfFile = req.files.pdf;
    const overlays = JSON.parse(req.body.overlays || '[]');
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../tmp');
    try {
      await fsPromises.mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Ignore if directory exists
    }

    // Process the PDF
    const doc = new PDFDocument();
    const outputPath = path.join(tempDir, `output_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Add images
    for (const overlay of overlays) {
      const imagePath = await base64ToFile(overlay.imageData, `image_${Date.now()}.png`);
      tempFiles.push(imagePath);
      
      doc.image(imagePath, overlay.x, overlay.y, {
        width: overlay.width,
        height: overlay.height
      });
      
      if (overlay.effects) {
        applyEffects(doc, overlay.effects);
      }
    }

    doc.end();
    await new Promise((resolve) => writeStream.on('finish', resolve));

    // Send the file
    res.download(outputPath, 'processed.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp files
      for (const file of tempFiles) {
        fsPromises.unlink(file).catch(console.error);
      }
      fsPromises.unlink(outputPath).catch(console.error);
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: error.message });
    
    // Clean up temp files on error
    for (const file of tempFiles) {
      fsPromises.unlink(file).catch(console.error);
    }
  }
});

// Finalize PDF with PDFKit for better image handling
router.post('/finalize', async (req, res) => {
  const tempFiles = [];
  
  try {
    if (!req.files || !req.files.pdf || !req.files.image) {
      return res.status(400).json({ error: 'Please upload both PDF and image files' });
    }

    const pdfFile = req.files.pdf;
    const imageFile = req.files.image;
    const imagePosition = JSON.parse(req.body.imagePosition);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../tmp');
    try {
      await fsPromises.mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Ignore if directory exists
    }

    // Save files temporarily
    const tempPdfPath = path.join(tempDir, `input_${Date.now()}.pdf`);
    const tempImagePath = path.join(tempDir, `image_${Date.now()}.png`);
    
    await pdfFile.mv(tempPdfPath);
    tempFiles.push(tempPdfPath);

    // Convert image to PNG for consistency
    await sharp(imageFile.data)
      .png()
      .toFile(tempImagePath);
    tempFiles.push(tempImagePath);

    // Load PDF to get dimensions
    const pdfBytes = await fsPromises.readFile(tempPdfPath);
    const pdfDoc = await PDFLib.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const page = pages[imagePosition.page];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Create new PDF with PDFKit
    const outputPath = path.join(tempDir, `output_${Date.now()}.pdf`);
    const doc = new PDFDocument({
      autoFirstPage: false,
      size: [pageWidth, pageHeight],
      margin: 0,
      fontConfig
    });

    // Pipe to output file
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Add page with same dimensions
    doc.addPage();

    // Draw original PDF page
    doc.image(tempPdfPath, 0, 0, {
      width: pageWidth,
      height: pageHeight
    });

    // Get image dimensions
    const imageInfo = await sharp(tempImagePath).metadata();
    const imageAspectRatio = imageInfo.width / imageInfo.height;

    // Calculate image dimensions in PDF points
    const targetWidth = (imagePosition.width / 100) * pageWidth;
    const targetHeight = targetWidth / imageAspectRatio; // Preserve aspect ratio

    // Convert percentage coordinates to PDF points
    const pdfX = (imagePosition.x / 100) * pageWidth;
    const pdfY = (imagePosition.y / 100) * pageHeight;

    // Draw the image at the calculated position and size
    doc.image(tempImagePath, pdfX, pdfY, {
      width: targetWidth,
      height: targetHeight,
      align: 'left',
      valign: 'top'
    });

    // Finalize the PDF
    doc.end();

    // Wait for writing to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Send the processed PDF
    res.download(outputPath, 'finalized.pdf', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      
      // Clean up temp files
      for (const file of tempFiles) {
        try {
          await fsPromises.unlink(file);
        } catch (e) {
          console.error('Error cleaning up file:', e);
        }
      }
      try {
        await fsPromises.unlink(outputPath);
      } catch (e) {
        console.error('Error cleaning up output file:', e);
      }
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Clean up temp files on error
    for (const file of tempFiles) {
      try {
        await fsPromises.unlink(file);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
