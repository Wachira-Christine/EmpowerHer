import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

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

  // 2. Prepare user profile data
  const userProfile = {
    fullName: name,
    email: email,
    phoneNumber: phoneNumber || '',
    role: 'user',
    accountStatus: 'active',
    createdAt: new Date().toISOString()
  };

  // 3. Save profile to Firestore
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
