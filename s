import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.AIzaSyAVYuEswLiTZD_tpV_7vQgED9RnK3Cy-QE,
  authDomain: Constants.expoConfig?.extra?.hisab-kitab-ad197.firebaseapp.com,
  projectId: Constants.expoConfig?.extra?.hisab-kitab-ad197,
  storageBucket: Constants.expoConfig?.extra?.hisab-kitab-ad197.firebasestorage.app,
  messagingSenderId: Constants.expoConfig?.extra?.838491649019,
  appId: Constants.expoConfig?.extra?.1:838491649019:web:16db04c04280fd5c2a915e,
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

// Initialize Firestore
const db = getFirestore(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };