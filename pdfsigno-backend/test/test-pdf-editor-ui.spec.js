const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('PDF Editor UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the PDF editor page
        await page.goto('http://localhost:3001/pdf-editor.html');
        // Wait for the page to be fully loaded
        await page.waitForLoadState('networkidle');
    });

    test('should load the PDF editor interface', async ({ page }) => {
        // Check for main UI elements
        await expect(page.locator('#pdfFile')).toBeVisible();
        await expect(page.locator('#addImageBtn')).toBeVisible();
        await expect(page.locator('#saveBtn')).toBeVisible();
        await expect(page.locator('#adobe-dc-view')).toBeVisible();
    });

    test('should upload a PDF file', async ({ page }) => {
        // Get the test PDF path
        const testPdfPath = path.join(__dirname, 'test.pdf');
        
        // Upload PDF file
        const fileInput = await page.locator('#pdfFile');
        await fileInput.setInputFiles(testPdfPath);
        
        // Wait for Adobe DC View to initialize
        await page.waitForTimeout(2000); // Give time for the PDF to load
    });

    test('should upload an image to PDF', async ({ page }) => {
        // First upload a PDF
        const testPdfPath = path.join(__dirname, 'test.pdf');
        await page.locator('#pdfFile').setInputFiles(testPdfPath);
        await page.waitForTimeout(2000); // Wait for PDF to load

        // Then upload an image
        const testImagePath = path.join(__dirname, 'test-image.png');
        await page.locator('#addImageBtn').click();
        await page.locator('#imageFile').setInputFiles(testImagePath);

        // Wait for image processing
        await page.waitForTimeout(2000);

        // Check if image properties panel becomes visible
        await expect(page.locator('#imageProperties')).toBeVisible();
    });

    test('should adjust image properties', async ({ page }) => {
        // Upload PDF and image first
        const testPdfPath = path.join(__dirname, 'test.pdf');
        const testImagePath = path.join(__dirname, 'test-image.png');
        
        await page.locator('#pdfFile').setInputFiles(testPdfPath);
        await page.waitForTimeout(2000); // Wait for PDF to load
        
        await page.locator('#addImageBtn').click();
        await page.locator('#imageFile').setInputFiles(testImagePath);
        await page.waitForTimeout(2000); // Wait for image to load

        // Test opacity slider
        const opacitySlider = page.locator('#imageOpacity');
        await opacitySlider.fill('50');
        await expect(opacitySlider).toHaveValue('50');

        // Test scale slider
        const scaleSlider = page.locator('#imageScale');
        await scaleSlider.fill('150');
        await expect(scaleSlider).toHaveValue('150');
    });

    test('should save modified PDF', async ({ page }) => {
        // Upload PDF and image
        const testPdfPath = path.join(__dirname, 'test.pdf');
        const testImagePath = path.join(__dirname, 'test-image.png');
        
        await page.locator('#pdfFile').setInputFiles(testPdfPath);
        await page.waitForTimeout(2000); // Wait for PDF to load
        
        await page.locator('#addImageBtn').click();
        await page.locator('#imageFile').setInputFiles(testImagePath);
        await page.waitForTimeout(2000); // Wait for image to load

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        
        // Click save button
        await page.locator('#saveBtn').click();
        
        // Wait for download to start
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('modified.pdf');
    });
});
