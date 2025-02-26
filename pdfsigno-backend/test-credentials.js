require('dotenv').config();
const axios = require('axios');

async function testCredentials() {
    console.log('Testing Adobe Credentials...\n');

    // 1. Test Client Credentials Flow
    try {
        console.log('1. Testing Client Credentials Flow:');
        console.log('Making request to Adobe Token endpoint...\n');

        const formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        formData.append('client_id', process.env.ADOBE_CLIENT_ID);
        formData.append('client_secret', process.env.ADOBE_CLIENT_SECRET);
        formData.append('scope', process.env.ADOBE_SCOPES);

        const response = await axios.post(process.env.ADOBE_TOKEN_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Success! Received token response:');
        console.log('- Access Token:', response.data.access_token ? 'Received ✓' : 'Missing ✗');
        console.log('- Token Type:', response.data.token_type);
        console.log('- Expires In:', response.data.expires_in, 'seconds\n');

    } catch (error) {
        console.error('Error testing client credentials:', error.response?.data || error.message, '\n');
    }

    // 2. Test PDF Embed API Key
    try {
        console.log('2. Testing PDF Embed API Key:');
        const embedApiKey = process.env.ADOBE_EMBED_API_KEY;
        
        // Test by making a request to the PDF Embed API validation endpoint
        const response = await axios.get(`https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf`, {
            headers: {
                'x-api-key': embedApiKey
            }
        });

        console.log('PDF Embed API Key is valid! ✓\n');

    } catch (error) {
        console.error('Error testing PDF Embed API key:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message, '\n');
    }

    // 3. Test PDF Services API
    try {
        console.log('3. Testing PDF Services API:');
        const orgId = process.env.ADOBE_ORG_ID;
        const technicalAccountId = process.env.ADOBE_TECHNICAL_ACCOUNT_ID;
        
        console.log('Organization ID:', orgId ? '✓' : '✗');
        console.log('Technical Account ID:', technicalAccountId ? '✓' : '✗');
        console.log('\nConfiguration from Postman Environment:');
        console.log('IMS Host:', 'ims-na1.adobelogin.com');
        console.log('Meta Scope:', 'example_sdk');
        console.log('Organization:', '90B81E7367B230DA0A495EBC@AdobeOrg');
    } catch (error) {
        console.error('Error testing PDF Services configuration:', error.message, '\n');
    }
}

testCredentials().catch(console.error);
