import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const googleProvider = new GoogleAuthProvider();

// Helper to retrieve user profile document from Firestore
export const getUserProfile = async (uid) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

// Register a normal user
export const registerUser = async (name, email, password, phoneNumber = '') => {
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Send email verification
  await sendEmailVerification(user);

  // 3. Prepare user profile data
  const userProfile = {
    fullName: name,
    email: email,
    phoneNumber: phoneNumber || '',
    role: 'user',
    authProvider: 'email',
    emailVerified: false,
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 4. Save profile to Firestore
  await setDoc(doc(db, 'users', user.uid), userProfile);

  return { user, profile: userProfile };
};

// Login user
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Fetch role & status from Firestore
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    throw new Error('User profile document not found in database.');
  }

  if (profile.accountStatus !== 'active') {
    await signOut(auth);
    throw new Error('This account is not active.');
  }

  return { user, profile };
};

// Logout user
export const logoutUser = async () => {
  await signOut(auth);
};

// Resend verification email
export const resendVerification = async (user) => {
  if (user) {
    await sendEmailVerification(user);
  }
};

// Login with Google
export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  let profile = await getUserProfile(user.uid);
  
  if (!profile) {
    // New user from Google
    profile = {
      fullName: user.displayName || 'Google User',
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: 'user',
      authProvider: 'google',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid), profile);
  } else if (profile.accountStatus !== 'active') {
    await signOut(auth);
    throw new Error('This account is not active.');
  }

  return { user, profile };
};
