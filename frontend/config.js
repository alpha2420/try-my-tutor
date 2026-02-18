import { Platform } from 'react-native';

const DEV_BACKEND_URL = Platform.select({
    ios: 'http://10.254.203.131:5050',
    android: 'http://10.254.203.131:5050',
    default: 'http://10.254.203.131:5050',
});

console.log('Using Backend URL:', DEV_BACKEND_URL);

export const API_URL = DEV_BACKEND_URL;
