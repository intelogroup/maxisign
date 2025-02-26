// Custom error class for PDF operations
class PDFOperationError extends Error {
    constructor(message, code, details) {
        super(message);
        this.name = 'PDFOperationError';
        this.code = code;
        this.details = details;
    }
}

// Error messages
const ERROR_MESSAGES = {
    CREDENTIALS_MISSING: 'Adobe API credentials are missing',
    AUTH_FAILED: 'Authentication failed. Please check your Adobe credentials',
    NETWORK_ERROR: 'Network error occurred while communicating with Adobe API',
    PDF_OPERATION_ERROR: 'Error occurred during PDF operation',
    INVALID_INPUT: 'Invalid input parameters'
};

module.exports = {
    PDFOperationError,
    ERROR_MESSAGES
};
