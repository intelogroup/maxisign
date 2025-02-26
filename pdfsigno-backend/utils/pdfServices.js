const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');
const path = require('path');
const { PDFOperationError } = require('./errors');

// Initialize the SDK
let credentials;
try {
    // Load credentials from JSON file
    const credentialsPath = path.join(__dirname, '../config/pdfservices-api-credentials.json');
    if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials file not found at: ${credentialsPath}`);
    }

    // Create credentials instance
    credentials = PDFServicesSdk.Credentials
        .serviceAccountCredentialsBuilder()
        .fromFile(credentialsPath)
        .build();

    console.log('✓ Adobe credentials loaded successfully');
} catch (err) {
    console.error('Error loading credentials:', {
        message: err.message,
        stack: err.stack
    });
    throw new PDFOperationError('Failed to load Adobe credentials', 'CREDENTIALS_ERROR', err);
}

// Create execution context
const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

const pdfOperations = {
    // Add or update an image in a PDF document using the SDK
    addOrUpdateImageInPDFUsingSDK: async (inputPath, imagePath, imageOptions = {}) => {
        try {
            // Validate input files exist
            if (!fs.existsSync(inputPath)) {
                throw new Error(`Input PDF file not found: ${inputPath}`);
            }
            if (!fs.existsSync(imagePath)) {
                throw new Error(`Input image file not found: ${imagePath}`);
            }

            // Validate file types
            if (!inputPath.toLowerCase().endsWith('.pdf')) {
                throw new Error('Input file must be a PDF');
            }
            if (!imagePath.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
                throw new Error('Image file must be JPG or PNG');
            }

            console.log('Adding/Updating image in PDF:', {
                input: inputPath,
                image: imagePath,
                options: JSON.stringify(imageOptions)
            });

            // Create a new operation instance
            console.log('Creating PDF operation...');
            const operation = PDFServicesSdk.PDFProperties.Operation.createNew();

            // Set input PDF
            console.log('Setting input PDF...');
            const input = PDFServicesSdk.FileRef.createFromLocalFile(
                inputPath,
                PDFServicesSdk.FileRef.pdfMimeType
            );
            operation.setInput(input);

            // Create options for image insertion
            const options = new PDFServicesSdk.PDFProperties.options.AddImageOptions.Builder()
                .withImage(imagePath)
                .atPage(imageOptions.page || 1)
                .withPosition(imageOptions.position?.x || 0, imageOptions.position?.y || 0)
                .withDimensions(imageOptions.position?.width || 100, imageOptions.position?.height || 100)
                .withRotation(imageOptions.rotation || 0)
                .withOpacity(imageOptions.opacity || 1)
                .build();
            operation.setOptions(options);

            // Execute the operation
            console.log('Executing image insertion operation...');
            const result = await operation.execute(executionContext);

            // Save the result
            const outputPath = path.join(
                path.dirname(inputPath),
                `${path.basename(inputPath, '.pdf')}_with_image.pdf`
            );
            
            console.log('Saving result to:', outputPath);
            await result.saveAsFile(outputPath);
            
            // Verify the output file was created
            if (!fs.existsSync(outputPath)) {
                throw new Error('Output file was not created successfully');
            }
            
            const stats = fs.statSync(outputPath);
            if (stats.size === 0) {
                throw new Error('Output file was created but is empty');
            }

            console.log('✓ Image added successfully. Output saved to:', outputPath, 'Size:', stats.size, 'bytes');
            
            return outputPath;
        } catch (err) {
            console.error('Error in addOrUpdateImageInPDFUsingSDK:', {
                message: err.message,
                stack: err.stack,
                inputPath,
                imagePath,
                options: JSON.stringify(imageOptions),
                errorType: err.constructor.name
            });

            // Check for specific error types
            if (err.message.includes('credentials')) {
                throw new PDFOperationError(
                    'Authentication failed with Adobe PDF Services',
                    'AUTH_ERROR',
                    err.message
                );
            } else if (err.message.includes('not found')) {
                throw new PDFOperationError(
                    'Required file not found',
                    'FILE_NOT_FOUND',
                    err.message
                );
            } else if (err.message.includes('network')) {
                throw new PDFOperationError(
                    'Network error while communicating with Adobe services',
                    'NETWORK_ERROR',
                    err.message
                );
            } else {
                throw new PDFOperationError(
                    'Failed to add/update image in PDF',
                    'PDF_OPERATION_ERROR',
                    err.message
                );
            }
        }
    }
};

module.exports = pdfOperations;
