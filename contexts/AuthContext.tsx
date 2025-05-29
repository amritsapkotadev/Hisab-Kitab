import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { User } from '@/types'; 
import { auth } from '../firebaseConfig';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser, // Firebase Auth User type
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

// Complete any pending auth sessions from WebBrowser
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

// Helper: convert FirebaseUser to your app's User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    firebaseUser,  
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'User',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    emailVerified: firebaseUser.emailVerified,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  // Configure Google Auth request using expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "838491649019-1aeakkv9jii0gd3qsufhjufpklg26ul9.apps.googleusercontent.com",
    iosClientId: "838491649019-11famfqbp1ji4t0j6iavh2oqjdc68t9j.apps.googleusercontent.com",
    webClientId: "838491649019-pdqeqouu7aipdquoconjol53aqthgf0m.apps.googleusercontent.com",
  });

  // Listen to Firebase Auth state changes properly with correct callback signature
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const appUser = convertFirebaseUser(fbUser);
        setUser(appUser);
        setFirebaseUser(fbUser);
        AsyncStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setUser(null);
        setFirebaseUser(null);
        AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect based on auth state and current router segment
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [user, segments, isLoading, router]);

  // Email/password sign-in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Email/password sign-up with profile update
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(fbUser, { displayName: name });
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  // Handle Google Sign-In response and Firebase credential sign-in
  useEffect(() => {
    const handleGoogleSignIn = async () => {
      if (response?.type === 'success') {
        const { idToken, accessToken } = response.authentication!;
        const credential = GoogleAuthProvider.credential(idToken, accessToken);

        try {
          setIsLoading(true);
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.error('Firebase sign-in with Google failed:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    handleGoogleSignIn();
  }, [response]);

  // Trigger Google Auth prompt
  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signIn,
        signUp,
        signOut: signOutUser,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context in your components
export const useAuth = () => useContext(AuthContext);
