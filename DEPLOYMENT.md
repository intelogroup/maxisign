# MaxiSign Deployment Guide

This guide provides step-by-step instructions for deploying the MaxiSign application, including the new client-side PDF processing features.

## GitHub Repository Management

### Updating the Repository

1. Commit your changes to the repository:
   ```
   git add frontend/src/components/PDFPreview.js frontend/src/utils/pdfUtils.js README.md
   git commit -m "Implement client-side PDF image overlay with server fallback"
   git push origin clean-branch
   ```

2. Create a pull request to merge your changes into the main branch (if using a feature branch workflow).

### Branch Strategy

- `main` - Production-ready code
- `clean-branch` - Development branch with latest features
- Feature branches - For specific feature development

## Building the Application

### Frontend Build

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Run the build script:
   ```
   .\build.bat
   ```
   
   Or use npm directly:
   ```
   npm run build
   ```

3. The build output will be in the `frontend/build` directory.

## Deployment Options

### Netlify Deployment

1. Push your changes to GitHub.

2. Netlify will automatically detect changes and build the application according to the `netlify.toml` configuration.

3. The application will be deployed to your Netlify site.

### Manual Deployment

1. Build the frontend as described above.

2. Copy the contents of the `frontend/build` directory to your web server.

3. Configure your web server to:
   - Serve the static files
   - Redirect all routes to `index.html` for client-side routing
   - Proxy API requests to the backend server

## Environment Variables

Ensure the following environment variables are set correctly:

### Frontend (.env.production)

- `REACT_APP_STORAGE_PREFIX` - Prefix for localStorage keys (e.g., `maxisign_prod_`)
- `REACT_APP_API_URL` - URL of the backend API
- `REACT_APP_ADOBE_CLIENT_ID` - Adobe PDF Embed API client ID

### Backend (.env)

- `PORT` - Port for the backend server
- `NODE_ENV` - Environment (production/development)
- `CORS_ORIGIN` - Allowed CORS origin

## Testing the Deployment

1. Verify that the PDF editor loads correctly.
2. Test the image placement functionality:
   - Upload a PDF
   - Drag and drop an image onto the PDF
   - Verify that the image appears at the correct position
3. Test the save functionality:
   - Place an image on a PDF
   - Click the Save button
   - Verify that the PDF downloads with the image embedded
4. Test the toolbar functionality:
   - Verify that all toolbar buttons are visible and working
   - Test zoom in/out
   - Test grid toggle

## Troubleshooting

### Client-side PDF Processing Issues

If the client-side PDF processing fails, the application will automatically fall back to server-side processing. Check the browser console for error messages.

Common issues:
- CORS errors when loading PDF
- Memory limitations in the browser
- Unsupported PDF features

### Toolbar Rendering Issues

If the toolbar is not rendering correctly:
1. Check that all required icons are imported
2. Verify that the CSS styles are being applied
3. Check for JavaScript errors in the console

## Rollback Procedure

If issues are encountered after deployment:

1. Revert to the previous commit:
   ```
   git revert [commit-hash]
   git push origin clean-branch
   ```

2. Rebuild and redeploy the application.
