const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const pdfOperations = require('../utils/pdfServices');

// Test configuration
const TEST_CONFIG = {
    inputPdfPath: path.join(__dirname, '../samples/test.pdf'),
    outputDir: path.join(__dirname, '../output'),
    imageSize: { width: 100, height: 100 },
    position: { x: 50, y: 50, width: 100, height: 100 }
};

// Helper function to create a test image
function createTestImage() {
    console.log('Creating test image...');
    const canvas = createCanvas(TEST_CONFIG.imageSize.width, TEST_CONFIG.imageSize.height);
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test pattern
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, TEST_CONFIG.imageSize.width, TEST_CONFIG.imageSize.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Test', 20, 50);
    
    return canvas.toDataURL();
}

// Helper function to ensure test environment
function setupTestEnvironment() {
    console.log('Setting up test environment...');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(TEST_CONFIG.outputDir)) {
        fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    }
    
    // Create a sample PDF if it doesn't exist
    if (!fs.existsSync(TEST_CONFIG.inputPdfPath)) {
        throw new Error(`Test PDF not found at ${TEST_CONFIG.inputPdfPath}`);
    }
}

// Helper function to validate operation result
function validateResult(result, operation) {
    console.log(`Validating ${operation} result...`);
    if (!result.success) {
        console.error(`❌ ${operation} failed:`, result.error);
        if (result.details) {
            console.error('Details:', result.details);
        }
        return false;
    }
    
    if (!fs.existsSync(result.outputPath)) {
        console.error(`❌ Output file not found: ${result.outputPath}`);
        return false;
    }
    
    console.log(`✓ ${operation} successful`);
    return true;
}

// Main test function
async function runTests() {
    try {
        console.log('\n=== Starting PDF Image Operations Tests ===\n');
        
        // Setup test environment
        setupTestEnvironment();
        
        // Test 1: Add image to PDF
        console.log('\nTest 1: Adding image to PDF');
        const imageData = createTestImage();
        const addResult = await pdfOperations.addOrUpdateImageInPDF(
            TEST_CONFIG.inputPdfPath,
            imageData,
            {
                position: TEST_CONFIG.position,
                rotation: 0,
                opacity: 1.0
            },
            'test_add_image.pdf'
        );
        
        if (!validateResult(addResult, 'Add image')) {
            throw new Error('Add image test failed');
        }
        
        // Test 2: Update image in PDF
        console.log('\nTest 2: Updating image in PDF');
        const updateResult = await pdfOperations.updateImageInPDF(
            addResult.outputPath,
            addResult.imageId,
            {
                position: {
                    x: 100,
                    y: 100,
                    width: 150,
                    height: 150
                },
                rotation: 45,
                opacity: 0.8
            },
            'test_update_image.pdf'
        );
        
        if (!validateResult(updateResult, 'Update image')) {
            throw new Error('Update image test failed');
        }
        
        // Test 3: Error handling - Invalid position
        console.log('\nTest 3: Testing error handling - Invalid position');
        const errorResult = await pdfOperations.addOrUpdateImageInPDF(
            TEST_CONFIG.inputPdfPath,
            imageData,
            {
                position: {
                    x: -50, // Invalid position
                    y: -50,
                    width: 0, // Invalid width
                    height: 0 // Invalid height
                }
            },
            'test_error.pdf'
        );
        
        if (errorResult.success) {
            throw new Error('Error handling test failed - Should have failed with invalid position');
        } else {
            console.log('✓ Error handling test passed:', errorResult.error);
        }
        
        console.log('\n=== All tests completed successfully ===\n');
        
    } catch (error) {
        console.error('\n❌ Tests failed:', error.message);
        if (error.details) {
            console.error('Details:', error.details);
        }
        process.exit(1);
    }
}

// Run the tests
console.log('\nChecking and installing required dependencies...');
runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
