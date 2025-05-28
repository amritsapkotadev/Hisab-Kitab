import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVYuEswLiTZD_tpV_7vQgED9RnK3Cy-QE",
  authDomain: "hisab-kitab-ad197.firebaseapp.com",
  projectId: "hisab-kitab-ad197",
  storageBucket: "hisab-kitab-ad197.firebasestorage.app",
  messagingSenderId: "838491649019",
  appId: "1:838491649019:web:16db04c04280fd5c2a915e",
  measurementId: "G-PKPBDH24BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };