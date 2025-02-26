const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function addImageToPDF(inputPdfPath, imagePath, outputPdfPath) {
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

    // Get the original image dimensions
    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;
    console.log('Original image dimensions:', { imgWidth, imgHeight });

    // Calculate position to center the image
    const desiredWidth = 200; // desired width in points
    const scale = desiredWidth / imgWidth;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Center the image on the page
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    console.log('Drawing image at:', { x, y, scaledWidth, scaledHeight });

    // Draw the image
    firstPage.drawImage(embeddedImage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

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
const outputPdf = path.join(__dirname, 'output_with_image.pdf');

addImageToPDF(inputPdf, imageFile, outputPdf);
