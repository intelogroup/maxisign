require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Test configuration
const API_URL = 'http://localhost:3001';
const TEST_PDF_PATH = path.join(__dirname, 'test-1.pdf');

// Test functions
async function testFileUpload() {
    try {
        console.log('\nTesting file upload...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(TEST_PDF_PATH));

        const response = await axios.post(`${API_URL}/api/pdf/upload`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('✓ File upload successful');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('✗ File upload failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        throw error;
    }
}

async function testSignPDF() {
    try {
        console.log('\nTesting PDF signing...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(TEST_PDF_PATH));
        formData.append('signerName', 'Test Signer');
        formData.append('signerEmail', 'test@example.com');
        formData.append('signaturePosition', JSON.stringify({
            page: 1,
            x: 100,
            y: 100
        }));

        const response = await axios.post(`${API_URL}/api/pdf/sign`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('✓ PDF signing successful');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('✗ PDF signing failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        throw error;
    }
}

async function testGetSigningStatus() {
    try {
        console.log('\nTesting get signing status...');
        const documentId = 'test-document-id'; // Replace with actual document ID
        
        const response = await axios.get(`${API_URL}/api/pdf/status/${documentId}`);

        console.log('✓ Get signing status successful');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('✗ Get signing status failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        throw error;
    }
}

// Run all tests
async function runTests() {
    console.log('Starting PDF signing API tests...');
    console.log('Test PDF file:', TEST_PDF_PATH);

    try {
        // Test file upload
        await testFileUpload();

        // Test PDF signing
        const signResult = await testSignPDF();

        // Test get signing status
        if (signResult && signResult.documentId) {
            await testGetSigningStatus(signResult.documentId);
        }

        console.log('\n✓ All tests completed successfully');
    } catch (error) {
        console.error('\n✗ Tests failed');
    }
}

// Run the tests
runTests();
