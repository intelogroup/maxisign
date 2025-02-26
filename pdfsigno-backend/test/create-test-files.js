const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a test PDF
function createTestPDF() {
    const doc = new PDFDocument();
    const outputPath = path.join(__dirname, 'resources', 'test.pdf');
    
    doc.pipe(fs.createWriteStream(outputPath));
    
    // Add some content to the PDF
    doc.fontSize(25).text('Test PDF Document', 100, 100);
    doc.fontSize(18).text('This is a sample PDF for testing image placement.', 100, 150);
    
    // Add some guide lines
    doc.moveTo(50, 50).lineTo(550, 50).stroke();  // Top horizontal
    doc.moveTo(50, 750).lineTo(550, 750).stroke(); // Bottom horizontal
    doc.moveTo(50, 50).lineTo(50, 750).stroke();   // Left vertical
    doc.moveTo(550, 50).lineTo(550, 750).stroke(); // Right vertical
    
    doc.end();
    console.log('Created test PDF:', outputPath);
}

// Create a test image
function createTestImage() {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    const outputPath = path.join(__dirname, 'resources', 'test.png');

    // Create a colorful rectangle
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 200, 200);
    
    // Add some text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Test Image', 50, 100);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log('Created test image:', outputPath);
}

// Ensure resources directory exists
const resourcesDir = path.join(__dirname, 'resources');
if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir);
}

// Create both test files
createTestPDF();
createTestImage();
