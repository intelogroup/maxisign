const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function modifyPDF(inputPdfPath, imagePath, outputPdfPath) {
    try {
        console.log('Reading input PDF from:', inputPdfPath);
        
        // Check if files exist
        if (!fs.existsSync(inputPdfPath)) {
            throw new Error(`Input PDF not found: ${inputPdfPath}`);
        }
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Read the existing PDF
        const existingPdfBytes = fs.readFileSync(inputPdfPath);
        console.log('Successfully read PDF, size:', existingPdfBytes.length, 'bytes');
        
        // Load the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        console.log('Successfully loaded PDF document');
        
        // Get the first page
        const pages = pdfDoc.getPages();
        console.log('PDF has', pages.length, 'pages');
        
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        console.log('Page dimensions:', { width, height });

        // Read and embed the image
        console.log('Reading image file...');
        const imageBytes = fs.readFileSync(imagePath);
        console.log('Successfully read image, size:', imageBytes.length, 'bytes');
        
        // Embed the PNG image
        console.log('Embedding image into PDF...');
        const image = await pdfDoc.embedPng(imageBytes);
        console.log('Successfully embedded image');

        // Calculate dimensions to place image in top-right corner
        const imageWidth = 150;
        const imageHeight = 150;
        const x = width - imageWidth - 50;  // 50 pixels from right margin
        const y = height - imageHeight - 50; // 50 pixels from top margin

        // Draw the image
        console.log('Drawing image at position:', { x, y, width: imageWidth, height: imageHeight });
        firstPage.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
            opacity: 0.8
        });

        // Save the modified PDF
        console.log('Saving modified PDF...');
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
        
        console.log('Modified PDF saved successfully to:', outputPdfPath);
        return outputPdfPath;
    } catch (err) {
        console.error('Error in modifyPDF:', err);
        throw err;
    }
}

// Run the test
async function runTest() {
    const imageFile = path.join(__dirname, 'resources', 'image.png');
    const inputPdf = path.join(__dirname, 'test-1.pdf');
    const outputPdf = path.join(__dirname, 'output_test1.pdf');

    console.log('Starting PDF modification test...');
    console.log('Input PDF:', inputPdf);
    console.log('Image file:', imageFile);
    console.log('Output will be saved to:', outputPdf);

    try {
        await modifyPDF(inputPdf, imageFile, outputPdf);
        console.log('Test completed successfully!');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTest();
