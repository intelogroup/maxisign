require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// First, try to load the PDF routes
let pdfRoutes;
try {
    console.log('Loading PDF routes...');
    pdfRoutes = require('./routes/pdf');
    console.log('✓ PDF routes loaded successfully');
} catch (error) {
    console.error('Error loading PDF routes:');
    console.error('- Error Name:', error.name);
    console.error('- Error Message:', error.message);
    console.error('- Stack Trace:', error.stack);
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// Log environment variables
console.log('\nEnvironment Configuration:');
console.log('- PORT:', process.env.PORT || 3001);
console.log('- ADOBE_CLIENT_ID:', process.env.ADOBE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('- ADOBE_CLIENT_SECRET:', process.env.ADOBE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- ADOBE_EMBED_API_KEY:', process.env.ADOBE_EMBED_API_KEY ? '✓ Set' : '✗ Missing');

// Middleware
console.log('\nSetting up middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
console.log('✓ Middleware configured');

// Ensure required directories exist
const requiredDirs = ['public', 'uploads', 'output'];
console.log('\nChecking required directories:');
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!require('fs').existsSync(dirPath)) {
        console.log(`Creating directory: ${dir}`);
        require('fs').mkdirSync(dirPath, { recursive: true });
    }
    console.log(`✓ Directory ${dir} exists`);
});

// PDF Routes
console.log('\nSetting up routes...');
app.use('/api/pdf', pdfRoutes);
console.log('✓ Routes configured');

// Serve the test page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'embed-test.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false,
        error: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`\nServer is running on port ${port}`);
    console.log('Node.js', process.version);
});
