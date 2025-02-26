require('dotenv').config();
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');
const path = require('path');

async function addImageToPDFWithAdobeSDK(inputPdfPath, imagePath, outputPdfPath) {
    try {
        // Initial setup, create credentials instance using client credentials
        const credentials = PDFServicesSdk.Credentials
            .clientCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        // Create execution context using credentials
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

        // Create a new operation instance
        const addImageOperation = PDFServicesSdk.AddImage.Operation.createNew();

        // Set operation input from a source file
        const input = PDFServicesSdk.FileRef.createFromLocalFile(inputPdfPath);
        addImageOperation.setInput(input);

        // Create file object from image
        const imageFileRef = PDFServicesSdk.FileRef.createFromLocalFile(imagePath);

        // Set image placement options
        // We'll test multiple positions like we did with PDF-Lib
        const imagePlacementCollection = {
            imageFiles: [
                {
                    imageFile: imageFileRef,
                    // Top left
                    placement: { 
                        x: 50,
                        y: 50,
                        width: 100
                    }
                },
                {
                    imageFile: imageFileRef,
                    // Top right
                    placement: {
                        x: 400,
                        y: 50,
                        width: 150
                    }
                },
                {
                    imageFile: imageFileRef,
                    // Center
                    placement: {
                        x: 200,
                        y: 300,
                        width: 200
                    }
                }
            ]
        };

        // Set options for the operation
        const options = new PDFServicesSdk.AddImage.Options();
        options.setImagePlacementCollection(imagePlacementCollection);
        addImageOperation.setOptions(options);

        // Execute the operation
        console.log('Executing Add Image operation...');
        const result = await addImageOperation.execute(executionContext);

        // Save the result to the specified location
        await result.saveAsFile(outputPdfPath);
        console.log(`PDF saved to ${outputPdfPath}`);

    } catch (err) {
        console.error('Exception encountered while executing operation:', err);
    }
}

// Run the test
const inputPdf = path.join(__dirname, 'resources', 'input.pdf');
const imageFile = path.join(__dirname, 'resources', 'image.png');
const outputPdf = path.join(__dirname, 'output_adobe_sdk.pdf');

console.log('Starting Adobe PDF Services SDK test...');
console.log('Input PDF:', inputPdf);
console.log('Image file:', imageFile);
console.log('Output will be saved to:', outputPdf);

addImageToPDFWithAdobeSDK(inputPdf, imageFile, outputPdf);
