const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testPDFEndpoint(testCase) {
    try {
        // Create form data
        const formData = new FormData();
        
        // Add the PDF and image files
        formData.append('pdf', fs.createReadStream(path.join(__dirname, 'resources', 'test.pdf')));
        formData.append('image', fs.createReadStream(path.join(__dirname, 'resources', 'test.png')));
        
        // Add parameters based on test case
        Object.entries(testCase.params).forEach(([key, value]) => {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });

        console.log(`Testing case: ${testCase.name}`);
        console.log('Parameters:', testCase.params);
        
        // Make the request
        const response = await axios.post('http://localhost:3001/api/pdf/process', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            responseType: 'arraybuffer'
        });

        // Save the response to a file
        const outputPath = path.join(__dirname, 'output', `test-result-${testCase.name}.pdf`);
        fs.writeFileSync(outputPath, response.data);
        
        console.log('Success! Output PDF saved to:', outputPath);
        return true;
    } catch (error) {
        console.error('Error testing endpoint:', error.response?.data || error.message);
        return false;
    }
}

// Define test cases
const testCases = [
    {
        name: 'center-image',
        params: {
            x: 200,
            y: 300,
            width: 200,
            height: 200,
            rotation: 0
        }
    },
    {
        name: 'rotated-image',
        params: {
            x: 300,
            y: 400,
            width: 150,
            height: 150,
            rotation: 45
        }
    },
    {
        name: 'with-shadow',
        params: {
            x: 100,
            y: 200,
            width: 200,
            height: 200,
            effects: {
                shadow: {
                    offsetX: 10,
                    offsetY: 10,
                    color: '#00000066'
                }
            }
        }
    },
    {
        name: 'with-border',
        params: {
            x: 400,
            y: 300,
            width: 200,
            height: 200,
            effects: {
                border: {
                    width: 5,
                    color: '#FF0000'
                }
            }
        }
    },
    {
        name: 'with-gradient',
        params: {
            x: 250,
            y: 350,
            width: 200,
            height: 200,
            opacity: 0.8,
            effects: {
                gradient: {
                    startColor: '#FF0000',
                    endColor: '#0000FF'
                }
            }
        }
    },
    {
        name: 'combined-effects',
        params: {
            x: 150,
            y: 250,
            width: 250,
            height: 250,
            rotation: 15,
            opacity: 0.9,
            effects: {
                shadow: {
                    offsetX: 8,
                    offsetY: 8,
                    color: '#00000044'
                },
                border: {
                    width: 3,
                    color: '#0000FF'
                }
            }
        }
    }
];

// Run all test cases
async function runAllTests() {
    console.log('Starting endpoint tests...');
    
    for (const testCase of testCases) {
        const success = await testPDFEndpoint(testCase);
        console.log(`Test case '${testCase.name}': ${success ? 'PASSED' : 'FAILED'}\n`);
    }
    
    console.log('All tests completed!');
}

// Run the tests
runAllTests();
