const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function addImageToPDFWithPDFKit(imagePath, outputPdfPath) {
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

            // Add some text to show page orientation
            doc.fontSize(20)
                .text('Test PDF with Multiple Image Placements', 50, 30);

            // Test different image placements
            const placements = [
                {
                    x: 50,
                    y: 100,
                    width: 100,
                    description: 'Small image (top-left)'
                },
                {
                    x: pageWidth - 250,
                    y: 100,
                    width: 200,
                    description: 'Medium image (top-right)'
                },
                {
                    x: (pageWidth - 300) / 2,
                    y: 300,
                    width: 300,
                    description: 'Large image (center)'
                },
                {
                    x: 50,
                    y: pageHeight - 150,
                    width: 100,
                    description: 'Small image (bottom-left)'
                }
            ];

            // Add each image placement
            placements.forEach((placement, index) => {
                console.log(`Adding image ${index + 1}:`, placement);
                
                // Add description above the image
                doc.fontSize(12)
                    .text(placement.description, 
                          placement.x, 
                          placement.y - 20);

                // Add the image
                doc.image(imagePath, 
                         placement.x, 
                         placement.y, 
                         {
                             width: placement.width,
                             align: 'left',
                             valign: 'top'
                         });
            });

            // Finalize the PDF
            doc.end();

            // Handle write stream events
            writeStream.on('finish', () => {
                console.log('PDF successfully created:', outputPdfPath);
                resolve();
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

// Run the test
const imageFile = path.join(__dirname, 'resources', 'image.png');
const outputPdf = path.join(__dirname, 'output_pdfkit.pdf');

console.log('Starting PDFKit test...');
console.log('Image file:', imageFile);
console.log('Output will be saved to:', outputPdf);

addImageToPDFWithPDFKit(imageFile, outputPdf)
    .then(() => console.log('Test completed successfully'))
    .catch(err => console.error('Test failed:', err));
