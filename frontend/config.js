import { Platform } from 'react-native';

const DEV_BACKEND_URL = Platform.select({
    ios: 'http://localhost:5050',
    android: 'http://10.0.2.2:5050',
    default: 'http://localhost:5050',
});

console.log('Using Backend URL:', DEV_BACKEND_URL);

export const API_URL = DEV_BACKEND_URL;
