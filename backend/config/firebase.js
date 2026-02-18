const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Check if credentials are provided via environment variables or file
// For this setup, we'll assume a service-account.json path is provided in .env
// OR individual fields are set in .env (common for production)

const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;

if (!admin.apps.length) {
    try {
        const path = require('path');

        if (serviceAccountPath) {
            // Resolve path relative to CWD to ensure it works with .env paths like ./config/...
            const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
            const serviceAccount = require(resolvedPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized with service account file.');
        } else {
            console.warn('FIREBASE_CREDENTIALS_PATH not set. Firebase Admin not initialized.');
            // Fallback for development if needed, or error out
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

module.exports = admin;
