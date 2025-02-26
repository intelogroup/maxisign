const { PDFDocument, rgb, degrees } = require('pdf-lib');
const PDFKit = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to create a PDF with advanced effects using PDFKit
async function createPDFWithEffects(imagePath, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit({
                size: 'A4',
                margin: 0
            });

            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            // Add title
            doc.fontSize(24)
               .text('Advanced Image Effects Demo', 50, 30, { align: 'center' });

            // 1. Image with shadow effect
            doc.fontSize(14)
               .text('1. Image with Drop Shadow', 50, 80);

            // Draw shadow first (slightly offset and blurred)
            doc.save()
               .translate(55, 105)
               .rect(0, 0, 100, 100)
               .fill('#00000033') // Semi-transparent black
               .restore();

            // Draw actual image
            doc.image(imagePath, 50, 100, {
                width: 100,
                height: 100
            });

            // 2. Image with border
            doc.fontSize(14)
               .text('2. Image with Decorative Border', 250, 80);

            // Draw border
            doc.rect(250, 100, 120, 120)
               .lineWidth(3)
               .stroke('#0066ff');

            // Draw image inside border
            doc.image(imagePath, 260, 110, {
                width: 100,
                height: 100
            });

            // 3. Image with gradient overlay
            doc.fontSize(14)
               .text('3. Image with Gradient Overlay', 50, 250);

            doc.image(imagePath, 50, 270, {
                width: 100,
                height: 100
            });

            // Add gradient overlay
            const gradient = doc.linearGradient(50, 270, 150, 370);
            gradient.stop(0, '#ff000033')
                   .stop(1, '#0000ff33');
            
            doc.rect(50, 270, 100, 100)
               .fill(gradient);

            // 4. Image with clipping mask (circular)
            doc.fontSize(14)
               .text('4. Circular Clipping Mask', 250, 250);

            doc.save()
               .circle(300, 320, 50)
               .clip()
               .image(imagePath, 250, 270, {
                   width: 100,
                   height: 100
               })
               .restore();

            // Finalize the PDF
            doc.end();

            writeStream.on('finish', () => {
                console.log('Created PDF with effects:', outputPath);
                resolve(outputPath);
            });

            writeStream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
}

// Function to add transformations using PDF-Lib
async function addTransformations(inputPdfPath, imagePath, outputPath) {
    try {
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPages()[0];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Embed the image
        const imageBytes = fs.readFileSync(imagePath);
        const image = await pdfDoc.embedPng(imageBytes);

        // 5. Rotated image with transparency
        page.drawImage(image, {
            x: 50,
            y: pageHeight - 550,
            width: 100,
            height: 100,
            rotate: degrees(45),
            opacity: 0.8
        });

        // Add label
        page.drawText('5. Rotated with Transparency', {
            x: 50,
            y: pageHeight - 500,
            size: 14
        });

        // 6. Scaled image with mirror effect
        page.drawImage(image, {
            x: pageWidth - 150,
            y: pageHeight - 550,
            width: 100,
            height: 100,
            rotate: degrees(180),
            opacity: 0.9
        });

        page.drawText('6. Mirror Effect', {
            x: pageWidth - 150,
            y: pageHeight - 500,
            size: 14
        });

        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, modifiedPdfBytes);
        console.log('Added transformations to PDF:', outputPath);
        return outputPath;
    } catch (err) {
        console.error('Error adding transformations:', err);
        throw err;
    }
}

// Main test function
async function runAdvancedTest() {
    const imageFile = path.join(__dirname, 'resources', 'image.png');
    const tempPdf = path.join(__dirname, 'temp_effects.pdf');
    const finalPdf = path.join(__dirname, 'output_advanced_effects.pdf');

    console.log('Starting advanced effects test...');
    console.log('Using image:', imageFile);

    try {
        // First create a PDF with basic effects using PDFKit
        console.log('Creating initial PDF with effects...');
        await createPDFWithEffects(imageFile, tempPdf);

        // Then add transformations using PDF-Lib
        console.log('Adding transformations...');
        await addTransformations(tempPdf, imageFile, finalPdf);

        // Clean up temporary file
        fs.unlinkSync(tempPdf);

        console.log('Test completed successfully!');
        console.log('Final PDF saved as:', finalPdf);
    } catch (err) {
        console.error('Test failed:', err);
    }
}

// Run the test
runAdvancedTest();
