# Documentation References

## PDF Libraries and APIs

### Adobe PDF Embed API
- [Adobe PDF Embed API Documentation](https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/)
- [Adobe PDF Embed API Samples](https://documentcloud.adobe.com/view-sdk-demo/index.html)
- [Adobe PDF Embed API GitHub](https://github.com/adobe/pdf-embed-api-samples)

### PDF-Lib
- [PDF-Lib Documentation](https://pdf-lib.js.org/)
- [PDF-Lib GitHub](https://github.com/Hopding/pdf-lib)
- Implementation examples in: `maxi sign-backend/docs/PDF_IMAGE_OPERATIONS.md`

### React Components and UI
- [Material-UI Documentation](https://mui.com/material-ui/)
- [React-Dropzone Documentation](https://react-dropzone.js.org/)
- [Styled-Components Documentation](https://styled-components.com/docs)

## Project-Specific Documentation

### Backend Implementation
Location: `maxi sign-backend/docs/PDF_IMAGE_OPERATIONS.md`
Key sections:
- Basic Image Insertion with PDF-Lib
- Advanced Effects with PDFKit
- Combined Approach Implementation
- Known Roadblocks and Solutions
- Error Handling Guidelines

### Code Examples

#### Basic Image Insertion
```javascript
async function basicImageInsertion() {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const image = await pdfDoc.embedPng(imageBytes);
  const page = pdfDoc.getPages()[0];
  
  page.drawImage(image, {
    x: 50,
    y: 50,
    width: 100,
    height: 100
  });
}
```

#### Advanced Effects
```javascript
const doc = new PDFKit();
doc.pipe(fs.createWriteStream('output.pdf'));

// For shadows:
doc.save()
   .translate(55, 105)
   .rect(0, 0, 100, 100)
   .fill('#00000033');

// For borders:
doc.rect(250, 100, 120, 120)
   .lineWidth(3)
   .stroke();
```

## Best Practices

### Image Handling
1. Always preserve aspect ratio
2. Implement proper error handling
3. Use streaming for large files
4. Validate file types and sizes

### PDF Operations
1. Start with basic operations
2. Add advanced features progressively
3. Implement proper cleanup
4. Handle memory management

### UI/UX Guidelines
1. Provide immediate visual feedback
2. Maintain consistent layout
3. Support drag-and-drop
4. Show clear error messages

## Testing Resources
- End-to-end tests: `maxi sign-backend/test/test-pdf-editor-ui.spec.js`
- PDF operations tests: `maxi sign-backend/test/test-pdf-operations.js`
- Advanced effects tests: `maxi sign-backend/test/test-advanced-effects.js`
- Image operations tests: `maxi sign-backend/test/test-image-operations.js`

## Environment Setup
1. Backend setup in `maxi sign-backend/`
2. Frontend setup in `frontend/`
3. Required environment variables in `.env.example`

## Additional Resources
- [Adobe PDF Services API](https://developer.adobe.com/document-services/apis/pdf-services/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Node.js Documentation](https://nodejs.org/en/docs/)
