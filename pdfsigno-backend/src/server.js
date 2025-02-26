const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs'); // Added fs module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp')
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/pdf', require('./routes/pdfkitProcessing'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Clean up any temporary files
  if (req.files) {
    Object.values(req.files).forEach(file => {
      if (file.tempFilePath) {
        try {
          fs.unlinkSync(file.tempFilePath);
        } catch (e) {
          console.error('Error cleaning up temp file:', e);
        }
      }
    });
  }

  // Send appropriate error response
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!'
    : err.message || 'Internal Server Error';

  res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // For testing purposes
