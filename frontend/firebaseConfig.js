import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Web Config
const firebaseConfig = {
    apiKey: "AIzaSyB3uQA2lvIxdW476U1U1e3tvsup67OizxI",
    authDomain: "trymytutor-app.firebaseapp.com",
    projectId: "trymytutor-app",
    storageBucket: "trymytutor-app.firebasestorage.app",
    messagingSenderId: "1075733485848",
    appId: "1:1075733485848:web:55d001ad48b5642d1d666d"
};

const app = initializeApp(firebaseConfig);

// Persistence configuration for React Native
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth, firebaseConfig };
