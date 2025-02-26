const { PDFDocument, degrees, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function addImageWithTransformations(inputPdfPath, imagePath, outputPdfPath) {
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
        
        // Get all pages
        const pages = pdfDoc.getPages();
        console.log('PDF has', pages.length, 'pages');

        // Read and embed the image
        console.log('Reading image file...');
        const imageBytes = fs.readFileSync(imagePath);
        const image = await pdfDoc.embedPng(imageBytes);
        console.log('Successfully embedded image');

        // Get original image dimensions
        const imgWidth = image.width;
        const imgHeight = image.height;
        console.log('Original image dimensions:', { imgWidth, imgHeight });

        // Process each page with different transformations
        pages.forEach((page, pageIndex) => {
            const { width: pageWidth, height: pageHeight } = page.getSize();
            console.log(`Processing page ${pageIndex + 1}, dimensions:`, { pageWidth, pageHeight });

            // Different transformation for each page
            switch (pageIndex) {
                case 0:
                    // Page 1: Four corners with different sizes and rotations
                    console.log('Page 1: Corner placements with rotations');
                    
                    // Top-left: Small and rotated 45 degrees
                    page.drawImage(image, {
                        x: 50,
                        y: pageHeight - 150,
                        width: 100,
                        height: 100,
                        rotate: degrees(45),
                        opacity: 1
                    });

                    // Top-right: Medium size with flip effect
                    page.drawImage(image, {
                        x: pageWidth - 200,
                        y: pageHeight - 200,
                        width: 150,
                        height: 150,
                        rotate: degrees(180),
                        opacity: 0.8
                    });

                    // Bottom-left: Large with transparency
                    page.drawImage(image, {
                        x: 50,
                        y: 150,
                        width: 200,
                        height: 200,
                        opacity: 0.6
                    });

                    // Bottom-right: Normal size with 90-degree rotation
                    page.drawImage(image, {
                        x: pageWidth - 150,
                        y: 100,
                        width: 100,
                        height: 100,
                        rotate: degrees(90),
                        opacity: 0.9
                    });
                    break;

                case 1:
                    // Page 2: Centered with scaling and rotation animation effect
                    console.log('Page 2: Spiral effect');
                    
                    // Create a spiral effect with 5 images
                    for (let i = 0; i < 5; i++) {
                        const scale = 1 - (i * 0.15); // Each image gets smaller
                        const size = 150 * scale;
                        const rotation = i * 30; // Each image rotated 30 degrees more
                        const opacity = 1 - (i * 0.15); // Each image more transparent
                        
                        page.drawImage(image, {
                            x: (pageWidth - size) / 2 + (i * 20),
                            y: (pageHeight - size) / 2 + (i * 20),
                            width: size,
                            height: size,
                            rotate: degrees(rotation),
                            opacity: opacity
                        });
                    }
                    break;

                default:
                    // Other pages: Grid layout
                    console.log(`Page ${pageIndex + 1}: Grid layout`);
                    
                    const gridSize = 2; // 2x2 grid
                    const margin = 50;
                    const availableWidth = pageWidth - (margin * 2);
                    const availableHeight = pageHeight - (margin * 2);
                    const cellWidth = availableWidth / gridSize;
                    const cellHeight = availableHeight / gridSize;
                    const imageSize = Math.min(cellWidth, cellHeight) - margin;

                    for (let row = 0; row < gridSize; row++) {
                        for (let col = 0; col < gridSize; col++) {
                            page.drawImage(image, {
                                x: margin + (col * cellWidth) + (cellWidth - imageSize) / 2,
                                y: pageHeight - margin - (row * cellHeight) - imageSize - (cellHeight - imageSize) / 2,
                                width: imageSize,
                                height: imageSize,
                                opacity: 0.8
                            });
                        }
                    }
            }
        });

        // Save the modified PDF
        console.log('Saving modified PDF...');
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
        
        console.log('Modified PDF saved successfully to:', outputPdfPath);
        return outputPdfPath;
    } catch (err) {
        console.error('Error in addImageWithTransformations:', err);
        throw err;
    }
}

// Run the test
async function runTest() {
    const imageFile = path.join(__dirname, 'resources', 'image.png');
    const inputPdf = path.join(__dirname, 'test-1.pdf');
    const outputPdf = path.join(__dirname, 'output_transformed.pdf');

    console.log('Starting PDF transformation test...');
    console.log('Input PDF:', inputPdf);
    console.log('Image file:', imageFile);
    console.log('Output will be saved to:', outputPdf);

    try {
        await addImageWithTransformations(inputPdf, imageFile, outputPdf);
        console.log('Test completed successfully!');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTest();
