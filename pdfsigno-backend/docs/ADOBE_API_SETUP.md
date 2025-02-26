# Adobe PDF Services API Setup Guide

## Quick Start

```bash
# 1. Install the SDK
npm install @adobe/pdfservices-node-sdk

# 2. Copy environment file
cp .env.example .env

# 3. Set up your credentials in .env
PDF_SERVICES_CLIENT_ID=your_client_id
PDF_SERVICES_CLIENT_SECRET=your_client_secret
ADOBE_ORG_ID=your_org_id
ADOBE_TECHNICAL_ACCOUNT_ID=your_tech_account_id
```

## Detailed Setup Process

### 1. Adobe Developer Console Setup

#### A. Create Adobe Account
1. Visit [Adobe Developer Console](https://console.adobe.io)
2. Sign up for a developer account if you don't have one
3. Verify your email address

#### B. Create New Project
1. Click "Create new project"
2. Select "Add API"
3. Choose "PDF Services API"
4. Generate credentials (save these immediately):
   - Client ID
   - Client Secret
   - Organization ID
   - Technical Account ID

### 2. SDK Installation

#### A. Basic Installation
```bash
npm install @adobe/pdfservices-node-sdk --save
```

#### B. Verify Installation
```bash
# Check if SDK is properly installed
npm list @adobe/pdfservices-node-sdk
```

### 3. Environment Configuration

#### A. Create Environment File
```bash
# Create .env file
touch .env

# Set required variables
cat << EOF > .env
PDF_SERVICES_CLIENT_ID=your_client_id
PDF_SERVICES_CLIENT_SECRET=your_client_secret
ADOBE_ORG_ID=your_org_id
ADOBE_TECHNICAL_ACCOUNT_ID=your_tech_account_id
EOF
```

#### B. Load Environment Variables
```javascript
// In your main application file
require('dotenv').config();
```

## Validation and Testing

### 1. Credential Validation

```javascript
// test-credentials.js
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

async function testCredentials() {
  try {
    const credentials = PDFServicesSdk.Credentials
      .serviceAccountCredentialsBuilder()
      .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
      .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
      .build();

    // Create execution context
    const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
    console.log('✅ Credentials validated successfully');
    return true;
  } catch (err) {
    console.error('❌ Credential validation failed:', err.message);
    return false;
  }
}

testCredentials();
```

### 2. Basic Operation Test

```javascript
// test-basic-operation.js
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

async function testBasicOperation() {
  try {
    // Create credentials
    const credentials = PDFServicesSdk.Credentials
      .serviceAccountCredentialsBuilder()
      .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
      .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
      .build();

    // Create execution context
    const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

    // Create a new PDF
    const createPDF = PDFServicesSdk.CreatePDF,
          createPdfOperation = createPDF.Operation.createNew();

    // Set operation input from a source file
    const input = PDFServicesSdk.FileRef.createFromLocalFile(
      'resources/test.docx',
      createPDF.SupportedSourceFormat.docx
    );
    createPdfOperation.setInput(input);

    // Execute the operation
    const result = await createPdfOperation.execute(executionContext);
    await result.saveAsFile('output/test-output.pdf');
    
    console.log('✅ Basic operation test successful');
    return true;
  } catch (err) {
    console.error('❌ Basic operation test failed:', err.message);
    return false;
  }
}

testBasicOperation();
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Authentication Errors

```javascript
// Error: "Authentication failed"
// Solution 1: Check credentials format
if (process.env.PDF_SERVICES_CLIENT_ID.includes(' ')) {
  console.error('Client ID contains spaces - remove them');
}

// Solution 2: Verify environment variables are loaded
console.log('Checking environment variables...');
const requiredVars = [
  'PDF_SERVICES_CLIENT_ID',
  'PDF_SERVICES_CLIENT_SECRET',
  'ADOBE_ORG_ID',
  'ADOBE_TECHNICAL_ACCOUNT_ID'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing ${varName}`);
  }
});
```

#### 2. Rate Limiting Issues

```javascript
// Implement exponential backoff
async function executeWithRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation.execute(executionContext);
    } catch (err) {
      if (err.message.includes('429') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}
```

#### 3. File Access Issues

```javascript
// Check file permissions and existence
const fs = require('fs').promises;

async function validateFileAccess(filePath) {
  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    console.log('File size:', stats.size);
    return true;
  } catch (err) {
    console.error('File access error:', err.message);
    return false;
  }
}
```

### Best Practices

#### 1. Credential Management

```javascript
// Use a credential manager
class CredentialManager {
  static async getCredentials() {
    if (!this.credentials) {
      this.credentials = PDFServicesSdk.Credentials
        .serviceAccountCredentialsBuilder()
        .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
        .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
        .build();
    }
    return this.credentials;
  }
}
```

#### 2. Error Handling

```javascript
// Implement comprehensive error handling
async function handlePDFOperation(operation) {
  try {
    const result = await operation.execute(executionContext);
    return result;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('Input file not found');
    } else if (err.code === 'EACCES') {
      throw new Error('Permission denied');
    } else if (err.message.includes('429')) {
      throw new Error('Rate limit exceeded');
    } else {
      throw new Error(`PDF operation failed: ${err.message}`);
    }
  }
}
```

#### 3. Resource Cleanup

```javascript
// Ensure proper cleanup of resources
async function cleanupOperation(result) {
  try {
    if (result && result.cleanup) {
      await result.cleanup();
    }
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
}
```

## Performance Optimization

### 1. Batch Processing

```javascript
// Implement batch processing for multiple files
async function processBatch(files, batchSize = 5) {
  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(file => processFile(file)));
  }
}
```

### 2. Caching

```javascript
// Implement result caching
const cache = new Map();

async function getCachedResult(operationKey) {
  if (cache.has(operationKey)) {
    return cache.get(operationKey);
  }
  
  const result = await performOperation(operationKey);
  cache.set(operationKey, result);
  return result;
}
```

## Monitoring and Logging

```javascript
// Implement operation monitoring
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'pdf-operations.log' })
  ]
});

async function monitoredOperation(operation) {
  const startTime = Date.now();
  try {
    const result = await operation.execute(executionContext);
    logger.info('Operation successful', {
      duration: Date.now() - startTime,
      operationType: operation.constructor.name
    });
    return result;
  } catch (err) {
    logger.error('Operation failed', {
      duration: Date.now() - startTime,
      error: err.message,
      operationType: operation.constructor.name
    });
    throw err;
  }
}
```

## Security Considerations

```javascript
// Implement secure file handling
const crypto = require('crypto');

async function secureFileOperation(filePath) {
  // Generate operation ID
  const operationId = crypto.randomBytes(16).toString('hex');
  
  try {
    // Verify file hash
    const fileHash = await getFileHash(filePath);
    
    // Log operation
    logger.info('Starting secure operation', {
      operationId,
      fileHash,
      timestamp: new Date().toISOString()
    });
    
    // Perform operation
    const result = await performOperation(filePath);
    
    // Verify result
    const resultHash = await getFileHash(result.path);
    logger.info('Operation completed', {
      operationId,
      inputHash: fileHash,
      outputHash: resultHash
    });
    
    return result;
  } catch (err) {
    logger.error('Secure operation failed', {
      operationId,
      error: err.message
    });
    throw err;
  }
}

async function getFileHash(filePath) {
  const hash = crypto.createHash('sha256');
  const data = await fs.readFile(filePath);
  hash.update(data);
  return hash.digest('hex');
}
