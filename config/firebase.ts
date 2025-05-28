import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth/react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAVYuEswLiTZD_tpV_7vQgED9RnK3Cy-QE",
  authDomain: "hisab-kitab-ad197.firebaseapp.com",
  projectId: "hisab-kitab-ad197",
  storageBucket: "hisab-kitab-ad197.firebasestorage.app",
  messagingSenderId: "838491649019",
  appId: "1:838491649019:web:16db04c04280fd5c2a915e",
  measurementId: "G-PKPBDH24BR"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };