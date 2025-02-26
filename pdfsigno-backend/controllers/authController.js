const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const axios = require('axios');

// Initialize the SDK
let credentials;
try {
    credentials = PDFServicesSdk.Credentials
        .serviceAccountCredentialsBuilder()
        .withClientId(process.env.ADOBE_CLIENT_ID)
        .withClientSecret(process.env.ADOBE_CLIENT_SECRET)
        .withOrganizationId(process.env.ADOBE_ORG_ID)
        .withAccountId(process.env.ADOBE_TECHNICAL_ACCOUNT_ID)
        .build();
} catch(err) {
    console.error('Error creating credentials:', err);
}

// Test the credentials by creating an execution context
const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

exports.getAccessToken = async (req, res) => {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.ADOBE_CLIENT_ID);
        params.append('client_secret', process.env.ADOBE_CLIENT_SECRET);
        params.append('scope', process.env.ADOBE_SCOPES);

        const response = await axios.post(process.env.ADOBE_TOKEN_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Store the token in session
        req.session.adobeToken = response.data.access_token;

        res.json({
            status: 'success',
            message: 'Successfully obtained Adobe access token',
            token_type: response.data.token_type,
            expires_in: response.data.expires_in
        });
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to obtain Adobe access token',
            error: error.response?.data || error.message
        });
    }
};

// Add a simple test endpoint to check PDF Embed API key
exports.testEmbedApiKey = (req, res) => {
    const embedApiKey = process.env.ADOBE_EMBED_API_KEY;
    if (embedApiKey) {
        res.json({
            status: 'success',
            message: 'PDF Embed API key is configured',
            clientId: embedApiKey
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'PDF Embed API key is not configured'
        });
    }
};

exports.testConnection = async (req, res) => {
    try {
        // If we got here, credentials are valid
        res.json({ 
            status: 'success', 
            message: 'Adobe PDF Services SDK credentials are valid',
            credentials: {
                clientId: process.env.ADOBE_CLIENT_ID,
                organizationId: process.env.ADOBE_ORG_ID,
                accountId: process.env.ADOBE_TECHNICAL_ACCOUNT_ID
            }
        });
    } catch (error) {
        console.error('Error testing connection:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to validate Adobe credentials',
            error: error.message 
        });
    }
};
