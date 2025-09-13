import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  return await signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      return { user, token };
    }
    return null;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    throw { errorCode, errorMessage, email, credential };
  }
};

export const logout = async () => {
  return await signOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
