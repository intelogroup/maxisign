const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const pdfOperations = require('../utils/pdfServices');

console.log('Loading PDF routes...');

// Configure file upload middleware
router.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Helper function to save uploaded file
const saveUploadedFile = async (file) => {
    const uploadPath = path.join(__dirname, '../uploads', file.name);
    await file.mv(uploadPath);
    return uploadPath;
};

// Upload PDF endpoint
router.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.file;
        const uploadPath = await saveUploadedFile(file);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            filePath: uploadPath
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add or update image in PDF
router.post('/addorupdateimage', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        // Get the PDF file
        const pdfFile = req.files.file;
        const uploadPath = await saveUploadedFile(pdfFile);

        // Get image data
        let imageData;
        if (req.files && req.files.image) {
            // If image is uploaded as a file
            imageData = req.files.image.data.toString('base64');
        } else if (req.body.imageData) {
            // If image is provided as base64 string
            imageData = req.body.imageData;
        } else {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Parse options
        const options = JSON.parse(req.body.options || '{}');
        const outputFilename = `image_${Date.now()}_${pdfFile.name}`;

        // Add or update image
        const result = await pdfOperations.addOrUpdateImageInPDF(
            uploadPath,
            imageData,
            options,
            outputFilename
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Image added/updated successfully',
                outputPath: result.outputPath,
                imageId: result.imageId
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error adding/updating image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update image properties in PDF
router.post('/updateimage', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        if (!req.body.imageId) {
            return res.status(400).json({ error: 'No image ID provided' });
        }

        const pdfFile = req.files.file;
        const uploadPath = await saveUploadedFile(pdfFile);
        const imageId = req.body.imageId;
        const updateOptions = JSON.parse(req.body.options || '{}');
        const outputFilename = `updated_${Date.now()}_${pdfFile.name}`;

        const result = await pdfOperations.updateImageInPDF(
            uploadPath,
            imageId,
            updateOptions,
            outputFilename
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Image updated successfully',
                outputPath: result.outputPath
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
