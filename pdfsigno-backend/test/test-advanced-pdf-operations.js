const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLib } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createAdvancedPDF(imagePath, outputPdfPath) {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 0
            });

            // Pipe the PDF into a write stream
            const writeStream = fs.createWriteStream(outputPdfPath);
            doc.pipe(writeStream);

            // Get page dimensions (A4)
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            console.log('Page dimensions:', { pageWidth, pageHeight });

            // Add title
            doc.fontSize(24)
                .text('Advanced PDF Image Transformations', 50, 30, {
                    align: 'center'
                });

            // 1. Basic image with rotation
            doc.fontSize(14)
                .text('1. Rotated Image (45 degrees)', 50, 100);

            doc.save() // Save the current graphics state
                .translate(150, 150) // Move to the center point
                .rotate(45, {origin: [0, 0]}) // Rotate 45 degrees
                .image(imagePath, 0, 0, {
                    width: 100
                })
                .restore(); // Restore the graphics state

            // 2. Image with transparency
            doc.fontSize(14)
                .text('2. Transparent Image (50% opacity)', 50, 250);

            doc.image(imagePath, 50, 280, {
                width: 100,
                opacity: 0.5
            });

            // 3. Scaled and flipped image
            doc.fontSize(14)
                .text('3. Scaled and Flipped Image', 300, 250);

            doc.save()
                .scale(-1, 1) // Flip horizontally
                .image(imagePath, -500, 280, { // Negative x-position due to flip
                    width: 100
                })
                .restore();

            // 4. Image with clipping path (circular)
            doc.fontSize(14)
                .text('4. Circular Clipped Image', 50, 400);

            doc.save()
                .circle(100, 500, 50) // Create circular path
                .clip() // Use it as a clipping path
                .image(imagePath, 50, 450, {
                    width: 100
                })
                .restore();

            // 5. Overlapping images with blend modes
            doc.fontSize(14)
                .text('5. Overlapping Images with Blend Mode', 300, 400);

            // First image
            doc.image(imagePath, 300, 450, {
                width: 100
            });

            // Second image with multiply blend mode
            doc.image(imagePath, 350, 500, {
                width: 100,
                opacity: 0.8
            });

            // Add a new page for more examples
            doc.addPage();

            // 6. Image tiling pattern
            doc.fontSize(14)
                .text('6. Image Tiling Pattern', 50, 50);

            // Create a 2x2 grid of small images
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    doc.image(imagePath, 50 + (j * 120), 100 + (i * 120), {
                        width: 100
                    });
                }
            }

            // 7. Image with shadow effect
            doc.fontSize(14)
                .text('7. Image with Shadow Effect', 50, 400);

            // First draw a blurred dark rectangle for shadow
            doc.save()
                .translate(55, 455)
                .rect(0, 0, 100, 100)
                .fill('#000000', 'multiply')
                .restore();

            // Then draw the actual image slightly offset
            doc.image(imagePath, 50, 450, {
                width: 100
            });

            // Finalize the PDF
            doc.end();

            // Handle write stream events
            writeStream.on('finish', () => {
                console.log('Advanced PDF created:', outputPdfPath);
                resolve(outputPdfPath);
            });

            writeStream.on('error', (err) => {
                console.error('Error writing PDF:', err);
                reject(err);
            });

        } catch (err) {
            console.error('Error creating PDF:', err);
            reject(err);
        }
    });
}

async function modifyExistingPDF(inputPdfPath, imagePath, outputPdfPath) {
    try {
        console.log('Reading input PDF from:', inputPdfPath);
        console.log('Using image from:', imagePath);
        
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
        
        const pdfDoc = await PDFLib.load(existingPdfBytes);
        console.log('Successfully loaded PDF document');
        
        // Get the first page
        const pages = pdfDoc.getPages();
        console.log('PDF has', pages.length, 'pages');
        
        const firstPage = pages[0];

        // Embed the image
        console.log('Reading image file...');
        const imageBytes = fs.readFileSync(imagePath);
        console.log('Successfully read image, size:', imageBytes.length, 'bytes');
        
        console.log('Embedding image into PDF...');
        const image = await pdfDoc.embedPng(imageBytes);
        console.log('Successfully embedded image');

        // Get page dimensions
        const { width: pageWidth, height: pageHeight } = firstPage.getSize();
        console.log('Page dimensions:', { pageWidth, pageHeight });

        // Add the image to different positions with various transformations
        console.log('Drawing image on page...');
        firstPage.drawImage(image, {
            x: pageWidth - 200,
            y: pageHeight - 200,
            width: 150,
            height: 150,
            rotate: PDFLib.degrees(45),
            opacity: 0.8
        });

        // Save the modified PDF
        console.log('Saving modified PDF...');
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
        
        console.log('Modified PDF saved successfully to:', outputPdfPath);
        return outputPdfPath;
    } catch (err) {
        console.error('Error in modifyExistingPDF:', err);
        throw err;
    }
}

// Run the tests
async function runTests() {
    const imageFile = path.join(__dirname, 'resources', 'image.png');
    const inputPdf = path.join(__dirname, 'test-1.pdf');
    const outputPdfAdvanced = path.join(__dirname, 'output_advanced_test1.pdf');
    const outputPdfModified = path.join(__dirname, 'output_modified_test1.pdf');

    console.log('Starting Advanced PDF Tests...');
    console.log('Input PDF:', inputPdf);
    
    try {
        // First create an advanced PDF with various transformations
        console.log('Creating advanced PDF...');
        await createAdvancedPDF(imageFile, outputPdfAdvanced);

        // Then modify the created PDF by adding more images
        console.log('Modifying the existing PDF...');
        await modifyExistingPDF(inputPdf, imageFile, outputPdfModified);

        console.log('All tests completed successfully!');
        console.log('Check the following files:');
        console.log('1.', outputPdfAdvanced, '- Contains various image transformations');
        console.log('2.', outputPdfModified, '- Contains modifications to test-1.pdf');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
