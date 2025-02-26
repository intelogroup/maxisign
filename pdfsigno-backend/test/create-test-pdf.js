const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create samples directory if it doesn't exist
const samplesDir = path.join(__dirname, '../samples');
if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
}

// Create a test PDF
const doc = new PDFDocument();
const outputPath = path.join(samplesDir, 'test.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Add some content
doc.fontSize(25).text('Test PDF Document', 100, 100);
doc.fontSize(18).text('This is a sample PDF for testing image operations.', 100, 150);

// Add some shapes
doc.rect(50, 200, 500, 200)
   .stroke();

doc.end();

console.log(`Created test PDF at: ${outputPath}`);
