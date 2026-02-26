const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Check if credentials are provided via environment variables or file
// For this setup, we'll assume a service-account.json path is provided in .env
// OR individual fields are set in .env (common for production)

const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
    try {
        const path = require('path');
        let serviceAccount;

        if (serviceAccountBase64) {
            const decodedAcc = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decodedAcc);
            console.log('Found Firebase credentials from BASE64 environment variable.');
        } else if (serviceAccountJson) {
            serviceAccount = JSON.parse(serviceAccountJson);
            console.log('Found Firebase credentials from JSON environment variable.');
        } else if (serviceAccountPath) {
            // Resolve path relative to CWD to ensure it works with .env paths like ./config/...
            const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
            serviceAccount = require(resolvedPath);
            console.log('Found Firebase credentials from service account file.');
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.warn('No Firebase credentials provided. Firebase Admin not initialized.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

module.exports = admin;