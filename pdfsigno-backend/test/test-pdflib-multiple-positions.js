const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function addImagesWithDifferentStyles(inputPdfPath, imagePath, outputPdfPath) {
  try {
    console.log('Loading PDF from:', inputPdfPath);
    const pdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    console.log('Loading image from:', imagePath);
    const imageBytes = fs.readFileSync(imagePath);
    const embeddedImage = await pdfDoc.embedPng(imageBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = firstPage.getSize();
    console.log('Page dimensions:', { pageWidth, pageHeight });

    // Original image dimensions
    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;
    console.log('Original image dimensions:', { imgWidth, imgHeight });

    // Test different positions and sizes
    const variations = [
      {
        // Top-left corner, small size
        width: 100,
        x: 50,
        y: pageHeight - 150,
        description: 'Top-left, small'
      },
      {
        // Top-right corner, medium size
        width: 150,
        x: pageWidth - 200,
        y: pageHeight - 200,
        description: 'Top-right, medium'
      },
      {
        // Bottom-left, large size
        width: 200,
        x: 50,
        y: 150,
        description: 'Bottom-left, large'
      },
      {
        // Bottom-right, very small size
        width: 75,
        x: pageWidth - 125,
        y: 100,
        description: 'Bottom-right, very small'
      },
      {
        // Center, original aspect ratio
        width: 150,
        x: (pageWidth - 150) / 2,
        y: (pageHeight - (150 * imgHeight / imgWidth)) / 2,
        description: 'Center, medium'
      }
    ];

    // Draw each variation
    for (const variant of variations) {
      const scale = variant.width / imgWidth;
      const scaledHeight = imgHeight * scale;

      console.log(`Drawing ${variant.description} at:`, {
        x: variant.x,
        y: variant.y,
        width: variant.width,
        height: scaledHeight
      });

      firstPage.drawImage(embeddedImage, {
        x: variant.x,
        y: variant.y,
        width: variant.width,
        height: scaledHeight
      });
    }

    // Save the PDF
    console.log('Saving modified PDF to:', outputPdfPath);
    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
    
    console.log('PDF successfully modified and saved!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
const inputPdf = path.join(__dirname, 'resources', 'input.pdf');
const imageFile = path.join(__dirname, 'resources', 'image.png');
const outputPdf = path.join(__dirname, 'output_multiple_images.pdf');

addImagesWithDifferentStyles(inputPdf, imageFile, outputPdf);
