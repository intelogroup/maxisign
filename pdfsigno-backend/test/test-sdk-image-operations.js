const path = require('path');
const fs = require('fs');
const pdfOperations = require('../utils/pdfServices');

async function createTestFiles() {
    // Create a test PDF if it doesn't exist
    const testPdfPath = path.join(__dirname, 'test.pdf');
    if (!fs.existsSync(testPdfPath)) {
        console.log('Creating test PDF...');
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(testPdfPath);
        doc.pipe(writeStream);
        doc.text('Test PDF for image operations');
        doc.end();
        await new Promise(resolve => writeStream.on('finish', resolve));
        console.log('✓ Test PDF created');
    }

    // Create a test image if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
        console.log('Creating test image...');
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(400, 300);
        const ctx = canvas.getContext('2d');
        
        // Draw a more complex test image
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(0, 0, 400, 300);
        
        // Add some shapes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(200, 150, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF Editor', 200, 145);
        ctx.font = '18px Arial';
        ctx.fillText('Test Image', 200, 170);
        
        const out = fs.createWriteStream(testImagePath);
        const stream = canvas.createJPEGStream({ quality: 0.95 });
        stream.pipe(out);
        await new Promise(resolve => out.on('finish', resolve));
        console.log('✓ Test image created');
    }

    return { testPdfPath, testImagePath };
}

async function simulatePdfEditorImageInsertion() {
    try {
        console.log('=== Starting PDF Editor Image Insertion Test ===\n');

        // Create test files
        const { testPdfPath, testImagePath } = await createTestFiles();

        // Simulate PDF editor interface actions
        console.log('\nSimulating PDF Editor interface actions:');
        
        // Step 1: Load PDF
        console.log('1. Opening PDF in editor...');
        if (!fs.existsSync(testPdfPath)) {
            throw new Error('Failed to load PDF');
        }
        console.log('✓ PDF loaded successfully');

        // Step 2: Select image insertion tool
        console.log('2. Selected image insertion tool');

        // Step 3: Configure image insertion parameters
        console.log('3. Configuring image insertion:');
        const editorOptions = {
            position: {
                x: 100,          // Center horizontally
                y: 200,          // Position in lower half
                width: 300,      // Larger size for better visibility
                height: 200      // Maintain aspect ratio
            },
            page: 1,            // First page
            opacity: 0.9,        // Slightly transparent
            rotation: 0          // No rotation
        };
        console.log('   - Position:', JSON.stringify(editorOptions.position));
        console.log('   - Page:', editorOptions.page);
        console.log('   - Opacity:', editorOptions.opacity);
        console.log('   - Rotation:', editorOptions.rotation);

        // Step 4: Insert image
        console.log('\n4. Inserting image...');
        const result = await pdfOperations.addOrUpdateImageInPDFUsingSDK(
            testPdfPath,
            testImagePath,
            editorOptions
        );

        // Step 5: Verify result
        if (fs.existsSync(result)) {
            const stats = fs.statSync(result);
            console.log('\n✓ Image insertion completed successfully');
            console.log('Output PDF details:');
            console.log('   - Location:', result);
            console.log('   - Size:', Math.round(stats.size / 1024), 'KB');
            console.log('   - Modified:', stats.mtime.toLocaleString());
        } else {
            throw new Error('Output PDF was not created');
        }

    } catch (error) {
        console.error('\n❌ PDF Editor Test failed:', error.message);
        if (error.details) {
            console.error('Error details:', error.details);
        }
        throw error; // Re-throw to handle in calling code
    }
}

// Run the test
simulatePdfEditorImageInsertion().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
