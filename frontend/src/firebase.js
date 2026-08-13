// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

// Your web app's Firebase configuration from console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Safely initialize analytics
let analytics = null;
isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics initialization skipped:", err);
});

export { onAuthStateChanged, analytics };

export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey;
};

/**
 * Register a new user with Email & Password
 */
export async function registerWithEmail({ firstName, middleName, lastName, email, phone, password }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  // Update Firebase display name
  await updateProfile(user, { displayName: fullName });

  // Save detailed profile to Firestore database
  await setDoc(doc(db, 'users', user.uid), {
    firstName,
    middleName: middleName || '',
    lastName,
    email,
    phone,
    createdAt: new Date().toISOString(),
    favorites: ['lavender', 'strawberry', 'cherry-tomato'],
    careLogs: {},
    theme: 'dark'
  });

  // Send Email Verification
  await sendEmailVerification(user);
  return user;
}

/**
 * Log in with Email & Password
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log in with Google Account
 */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create Firestore document if first time Google sign-in
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const nameParts = (user.displayName || '').split(' ');
    await setDoc(userDocRef, {
      firstName: nameParts[0] || 'User',
      middleName: '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email,
      phone: user.phoneNumber || '',
      createdAt: new Date().toISOString(),
      favorites: ['lavender', 'strawberry', 'cherry-tomato'],
      careLogs: {},
      theme: 'dark'
    });
  }

  return user;
}

/**
 * Resend email verification link
 */
export async function resendVerificationLink() {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Fetch user document from Firestore
 */
export async function getUserProfile(uid) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.warn("Error fetching user profile:", err);
  }
  return null;
}

/**
 * Sync user favorites to Firestore
 */
export async function syncUserFavorites(uid, favorites) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { favorites });
  } catch (err) {
    console.warn("Error syncing favorites to Firestore:", err);
  }
}

/**
 * Sync care logs to Firestore
 */
export async function syncUserCareLogs(uid, careLogs) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { careLogs });
  } catch (err) {
    console.warn("Error syncing care logs to Firestore:", err);
  }
}

/**
 * Ensure user profile exists in Firestore and return it
 */
export async function ensureUserProfile(user) {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const nameParts = (user.displayName || '').split(' ');
    const profile = {
      firstName: nameParts[0] || 'User',
      middleName: '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      createdAt: new Date().toISOString(),
      favorites: ['lavender', 'strawberry', 'cherry-tomato'],
      careLogs: {},
      theme: 'dark'
    };
    await setDoc(userDocRef, profile);
    return profile;
  }
  return userDoc.data();
}

/**
 * Sync user theme preference to Firestore
 */
export async function syncUserTheme(uid, theme) {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { theme });
  } catch (err) {
    console.warn("Error syncing theme to Firestore:", err);
  }
}
