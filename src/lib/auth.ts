import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '@/firebase/config';

export const signIn = async (email, password) => {
  return firebaseSignIn(auth, email, password);
};

export const signUp = async (email, password) => {
  return firebaseSignUp(auth, email, password);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  return firebaseSignOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
