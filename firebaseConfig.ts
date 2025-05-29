
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAVYuEswLiTZD_tpV_7vQgED9RnK3Cy-QE",
  authDomain: "hisab-kitab-ad197.firebaseapp.com",
  projectId: "hisab-kitab-ad197",
  storageBucket: "hisab-kitab-ad197.firebasestorage.app",
  messagingSenderId: "838491649019",
  appId: "1:838491649019:web:16db04c04280fd5c2a915e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
