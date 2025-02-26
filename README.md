# MaxiSign

MaxiSign is a web application for PDF editing and document management. It allows users to upload, edit, and manage PDF documents with features for adding text, signatures, and images.

## Features

- **PDF Editor**: Upload and edit PDF documents
- **Document Management**: Store and organize your documents
- **Text and Signature Tools**: Add text and signatures to your PDFs
- **Image Placement**: Drag and drop images onto your PDF documents
- **Image Editor** (Coming Soon): Edit and manipulate images

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/maxisign.git
cd maxisign
```

2. Install dependencies for the frontend
```
cd frontend
npm install
```

3. Install dependencies for the backend
```
cd ../pdfsigno-backend
npm install
```

### Development

1. Start the frontend development server
```
cd frontend
npm start
```

2. Start the backend server
```
cd pdfsigno-backend
npm start
```

### Building for Production

1. Build the frontend
```
cd frontend
npm run build
```
   
   Or use the provided build script:
```
cd frontend
build.bat
```

2. The build files will be in the `frontend/build` directory. Copy these files to your web server.

3. Configure your web server to serve the static files and proxy API requests to the backend server.

## Environment Variables

The application uses environment variables for configuration. See the `.env` and `.env.production` files for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Adobe PDF Embed API](https://developer.adobe.com/document-services/apis/pdf-embed/)
- [PDF-Lib](https://pdf-lib.js.org/)
- [Material-UI](https://mui.com/)
- [React](https://reactjs.org/)
