require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const querystring = require('querystring');

// Adobe API credentials
const clientId = process.env.ADOBE_CLIENT_ID;
const clientSecret = process.env.ADOBE_CLIENT_SECRET;

// API endpoints
const AUTH_ENDPOINT = 'https://ims-na1.adobelogin.com/ims/token/v3';
const API_ENDPOINT = 'https://pdf-services.adobe.io/api/v2/export/pdf';

// Test functions
async function getAccessToken() {
    try {
        const tokenData = querystring.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'openid,ent_documentcloud_sdk'
        });

        console.log('Requesting access token...');

        const response = await axios.post(AUTH_ENDPOINT, tokenData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('Access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
}

async function convertPDFToDocx(inputPath) {
    try {
        // Get access token
        const accessToken = await getAccessToken();
        
        // Create form data
        const formData = new FormData();
        formData.append('pdf', fs.createReadStream(inputPath));
        
        console.log('Making conversion request...');
        console.log('Input file:', inputPath);
        console.log('Access token:', accessToken ? '✓ Present' : '✗ Missing');
        console.log('Client ID:', clientId ? '✓ Present' : '✗ Missing');
        
        // Make the conversion request
        const response = await axios.post(API_ENDPOINT, formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-api-key': clientId,
                ...formData.getHeaders(),
                'Accept': 'application/json'
            },
            params: {
                format: 'docx'
            }
        });
        
        console.log('Conversion request successful:');
        console.log(response.data);
        
        // Download the result
        if (response.data.url) {
            const downloadResponse = await axios.get(response.data.url, {
                responseType: 'stream',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-api-key': clientId
                }
            });
            
            const outputPath = path.join(__dirname, '../output/converted.docx');
            const writer = fs.createWriteStream(outputPath);
            downloadResponse.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log('File downloaded successfully to:', outputPath);
                    resolve(outputPath);
                });
                writer.on('error', reject);
            });
        }
    } catch (error) {
        console.error('Error converting PDF:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Run the test
async function runTest() {
    try {
        const inputPath = path.join(__dirname, 'test-1.pdf');
        console.log('Starting PDF conversion test...');
        console.log('Client ID:', clientId ? '✓ Present' : '✗ Missing');
        console.log('Client Secret:', clientSecret ? '✓ Present' : '✗ Missing');
        await convertPDFToDocx(inputPath);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTest();
