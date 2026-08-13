// src/firebase.js
// Mock Firebase SDK running purely in local storage / memory.
// This allows you to keep all Login, Signup, and Verify Email pages working 
// without installing the actual Firebase SDK or configuring external databases.

// List of registered callbacks for auth state changes
let authSubscribers = [];

// Initialize current user from localStorage
const getSavedCurrentUser = () => {
  const saved = localStorage.getItem('bloomify_current_user');
  return saved ? JSON.parse(saved) : null;
};

// Internal list of registered users
const getLocalUsers = () => {
  const saved = localStorage.getItem('bloomify_local_users');
  return saved ? JSON.parse(saved) : [];
};

const saveLocalUsers = (users) => {
  localStorage.setItem('bloomify_local_users', JSON.stringify(users));
};

export const auth = {
  get currentUser() {
    return getSavedCurrentUser();
  },
  set currentUser(val) {
    if (val) {
      localStorage.setItem('bloomify_current_user', JSON.stringify(val));
    } else {
      localStorage.removeItem('bloomify_current_user');
    }
    // Notify all listeners
    authSubscribers.forEach(cb => cb(val));
  }
};

// Add helper to mock reload in VerifyEmail.jsx
if (auth.currentUser) {
  auth.currentUser.reload = async function() {
    const user = getSavedCurrentUser();
    if (user) {
      user.emailVerified = true;
      auth.currentUser = user;
      // Also update in registered users list
      const users = getLocalUsers();
      const idx = users.findIndex(u => u.uid === user.uid);
      if (idx !== -1) {
        users[idx].emailVerified = true;
        saveLocalUsers(users);
      }
    }
  };
}

export const db = {}; // Firestore placeholder

export const onAuthStateChanged = (authObj, callback) => {
  // Trigger callback immediately with initial state
  callback(auth.currentUser);
  authSubscribers.push(callback);
  return () => {
    authSubscribers = authSubscribers.filter(cb => cb !== callback);
  };
};

// Return true so we use full interactive logic rather than static demo fallbacks
export const isFirebaseConfigured = () => {
  return true;
};

/**
 * Mock Register
 */
export async function registerWithEmail({ firstName, middleName, lastName, email, phone, password }) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = getLocalUsers();
  const emailLower = email.toLowerCase().trim();

  // Check duplicate email
  if (users.some(u => u.email.toLowerCase().trim() === emailLower)) {
    const err = new Error('An account with this email address already exists.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const uid = 'user_' + Math.random().toString(36).substr(2, 9);
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  const newUser = {
    uid,
    email: emailLower,
    displayName: fullName,
    emailVerified: false,
    phone
  };

  // Add to user database
  users.push({ ...newUser, password });
  saveLocalUsers(users);

  // Save profile doc
  const userProfile = {
    firstName,
    middleName: middleName || '',
    lastName,
    email: emailLower,
    phone,
    createdAt: new Date().toISOString(),
    favorites: ['lavender', 'strawberry', 'cherry-tomato'],
    careLogs: {}
  };
  localStorage.setItem(`bloomify_profile_${uid}`, JSON.stringify(userProfile));

  // Log in as unverified user
  auth.currentUser = {
    ...newUser,
    reload: async function() {
      const cur = getSavedCurrentUser();
      if (cur) {
        cur.emailVerified = true;
        auth.currentUser = cur;
        
        // Update database status
        const list = getLocalUsers();
        const idx = list.findIndex(u => u.uid === uid);
        if (idx !== -1) {
          list[idx].emailVerified = true;
          saveLocalUsers(list);
        }
      }
    }
  };

  return auth.currentUser;
}

/**
 * Mock Login
 */
export async function loginWithEmail(email, password) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = getLocalUsers();
  const emailLower = email.toLowerCase().trim();

  const user = users.find(u => u.email.toLowerCase().trim() === emailLower);

  if (!user || user.password !== password) {
    const err = new Error('Invalid email or password. Please check your credentials.');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const loggedInUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    reload: async function() {
      const cur = getSavedCurrentUser();
      if (cur) {
        cur.emailVerified = true;
        auth.currentUser = cur;
      }
    }
  };

  auth.currentUser = loggedInUser;
  return loggedInUser;
}

/**
 * Mock Google Sign In
 */
export async function loginWithGoogle() {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockGoogleUsers = [
    { displayName: 'Flora Explorer', email: 'flora.explorer@gmail.com' },
    { displayName: 'Green Thumb Jane', email: 'jane.gardening@gmail.com' },
    { displayName: 'Leafy Collector', email: 'leafy.botanist@gmail.com' }
  ];

  // Pick one randomly
  const base = mockGoogleUsers[Math.floor(Math.random() * mockGoogleUsers.length)];
  const uid = 'google_' + Math.random().toString(36).substr(2, 9);

  const loggedInUser = {
    uid,
    email: base.email,
    displayName: base.displayName,
    emailVerified: true,
    reload: async () => {}
  };

  // Check if profile exists, otherwise create
  const profileKey = `bloomify_profile_${uid}`;
  if (!localStorage.getItem(profileKey)) {
    const nameParts = base.displayName.split(' ');
    const userProfile = {
      firstName: nameParts[0],
      middleName: '',
      lastName: nameParts[1] || '',
      email: base.email,
      phone: '',
      createdAt: new Date().toISOString(),
      favorites: ['lavender', 'strawberry', 'cherry-tomato'],
      careLogs: {}
    };
    localStorage.setItem(profileKey, JSON.stringify(userProfile));
  }

  auth.currentUser = loggedInUser;
  return loggedInUser;
}

/**
 * Resend Link
 */
export async function resendVerificationLink() {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Mock verification link resent to:", auth.currentUser?.email);
}

/**
 * Logout
 */
export async function logoutUser() {
  auth.currentUser = null;
}

/**
 * Get profile data
 */
export async function getUserProfile(uid) {
  const profile = localStorage.getItem(`bloomify_profile_${uid}`);
  return profile ? JSON.parse(profile) : null;
}

/**
 * Sync user favorites
 */
export async function syncUserFavorites(uid, favorites) {
  const profile = await getUserProfile(uid);
  if (profile) {
    profile.favorites = favorites;
    localStorage.setItem(`bloomify_profile_${uid}`, JSON.stringify(profile));
  }
}

/**
 * Sync care logs
 */
export async function syncUserCareLogs(uid, careLogs) {
  const profile = await getUserProfile(uid);
  if (profile) {
    profile.careLogs = careLogs;
    localStorage.setItem(`bloomify_profile_${uid}`, JSON.stringify(profile));
  }
}
