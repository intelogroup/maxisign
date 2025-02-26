const fs = require('fs');
const path = require('path');
const pdfOperations = require('../utils/pdfServices');

async function testPDFOperations() {
    console.log('Testing PDF Operations...\n');

    // Create test directories if they don't exist
    const testDir = path.join(__dirname, 'test-files');
    const outputDir = path.join(__dirname, '../output');
    
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Test 1: Create PDF from DOCX
    try {
        console.log('1. Testing Create PDF from DOCX:');
        const docxPath = path.join(testDir, 'test.docx');
        const result = await pdfOperations.createPDFFromDocx(
            docxPath,
            'test_created.pdf'
        );
        console.log('Result:', result.success ? '✓' : '✗');
        if (!result.success) console.error('Error:', result.error);
        console.log();
    } catch (error) {
        console.error('Error in Create PDF test:', error.message, '\n');
    }

    // Test 2: Compress PDF
    try {
        console.log('2. Testing PDF Compression:');
        const pdfPath = path.join(testDir, 'test.pdf');
        const result = await pdfOperations.compressPDF(
            pdfPath,
            'test_compressed.pdf'
        );
        console.log('Result:', result.success ? '✓' : '✗');
        if (!result.success) console.error('Error:', result.error);
        console.log();
    } catch (error) {
        console.error('Error in Compress PDF test:', error.message, '\n');
    }

    // Test 3: Add Form Fields to PDF
    try {
        console.log('3. Testing Add Form Fields:');
        const pdfPath = path.join(testDir, 'test.pdf');
        const fields = [
            {
                type: 'text',
                name: 'fullName',
                defaultValue: '',
                required: true,
                position: { x: 100, y: 100, width: 200, height: 30 },
                page: 1
            },
            {
                type: 'signature',
                name: 'signature',
                position: { x: 100, y: 200, width: 200, height: 100 },
                page: 1
            }
        ];
        const result = await pdfOperations.addFormFields(
            pdfPath,
            fields,
            'test_with_fields.pdf'
        );
        console.log('Result:', result.success ? '✓' : '✗');
        if (!result.success) console.error('Error:', result.error);
        console.log();
    } catch (error) {
        console.error('Error in Add Form Fields test:', error.message, '\n');
    }

    // Test 4: Edit PDF
    try {
        console.log('4. Testing PDF Editing:');
        const pdfPath = path.join(testDir, 'test.pdf');
        const operations = [
            {
                type: 'text',
                content: 'Sample Text',
                position: { x: 100, y: 100 },
                font: 'Helvetica',
                fontSize: 12,
                color: '#000000',
                page: 1
            },
            {
                type: 'rectangle',
                position: { x: 200, y: 200, width: 100, height: 50 },
                strokeColor: '#000000',
                fillColor: '#ffffff',
                page: 1
            }
        ];
        const result = await pdfOperations.editPDF(
            pdfPath,
            operations,
            'test_edited.pdf'
        );
        console.log('Result:', result.success ? '✓' : '✗');
        if (!result.success) console.error('Error:', result.error);
        console.log();
    } catch (error) {
        console.error('Error in Edit PDF test:', error.message, '\n');
    }

    // Test 5: Add Image to PDF
    try {
        console.log('5. Testing Add Image to PDF:');
        const pdfPath = path.join(testDir, 'test.pdf');
        const imageData = fs.readFileSync(path.join(testDir, 'test-image.png')).toString('base64');
        const options = {
            position: { x: 100, y: 100, width: 200, height: 200 },
            page: 1,
            preserveAspectRatio: true
        };
        const result = await pdfOperations.addImageToPDF(
            pdfPath,
            imageData,
            options,
            'test_with_image.pdf'
        );
        console.log('Result:', result.success ? '✓' : '✗');
        if (!result.success) console.error('Error:', result.error);
        console.log();
    } catch (error) {
        console.error('Error in Add Image test:', error.message, '\n');
    }
}

// Run the tests
testPDFOperations().catch(console.error);
