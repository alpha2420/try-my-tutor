const axios = require('axios');

const API_URL = 'http://localhost:5050/api';

async function testBackend() {
    try {
        console.log('--- Starting Backend Verification ---');

        // Note: Since we use Firebase Auth, we can't easily mock generation of valid Firebase ID tokens 
        // without hitting Firebase real API or using the Emulator.
        // For this test, we might hit a brick wall unless we mocked the 'verifyToken' middleware 
        // OR if we start the server in a "test mode" that bypasses auth.

        // Let's assume for this verification script dealing with Firebase is too complex for now 
        // without a real client key.
        // I will check if the server is up first.

        const rootRes = await axios.get('http://localhost:5050/');
        console.log('Server Status:', rootRes.data);

        // If we can't get a valid token, we can't test protected routes.
        // I'll create a simple public test route in server.js to verify DB connection at least.

    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testBackend();
