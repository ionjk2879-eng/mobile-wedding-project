import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { app } from './index';

let _auth: Auth | null = null;
const getAuthInstance = (): Auth => {
  if (!_auth) _auth = getAuth(app);
  return _auth;
};

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(getAuthInstance(), googleProvider);

export const signOut = () => firebaseSignOut(getAuthInstance());

export const getCurrentUser = (): User | null => getAuthInstance().currentUser;

export const onAuthChanged = (callback: (user: User | null) => void) =>
  onAuthStateChanged(getAuthInstance(), callback);
