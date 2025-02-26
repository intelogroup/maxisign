const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 200x100 canvas
const canvas = createCanvas(200, 100);
const ctx = canvas.getContext('2d');

// Draw a blue rectangle
ctx.fillStyle = '#0066ff';
ctx.fillRect(0, 0, 200, 100);

// Add some text
ctx.fillStyle = 'white';
ctx.font = '20px Arial';
ctx.fillText('Test Image', 50, 55);

// Save as PNG
const out = fs.createWriteStream(path.join(__dirname, 'resources', 'image.png'));
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log('Test image created'));
