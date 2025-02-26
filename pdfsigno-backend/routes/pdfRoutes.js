const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const upload = require('../middleware/multerConfig');

// Endpoint for PDF file upload
router.post('/upload-pdf', upload.single('pdf'), pdfController.uploadPDF);

// Endpoint for image file upload
router.post('/upload-image', upload.single('image'), pdfController.uploadImage);

// Endpoint to process the PDF (e.g., insert images, update form fields)
router.post('/process-pdf', pdfController.processPDF);

module.exports = router;
