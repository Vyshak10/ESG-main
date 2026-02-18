const axios = require('axios');
require('dotenv').config();

const url = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

console.log(`Testing connectivity to: ${url}/health`);

async function testConnection() {
    try {
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Connection failed!');
        console.error('Message:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testConnection();
