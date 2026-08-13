// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsH4v01PTk_vVnRgK_n8yjhy-6P25zdfM",
  authDomain: "bloomify-2686d.firebaseapp.com",
  projectId: "bloomify-2686d",
  storageBucket: "bloomify-2686d.firebasestorage.app",
  messagingSenderId: "964285727866",
  appId: "1:964285727866:web:af247d935f5f0b38ece7c3",
  measurementId: "G-KN5T01J2ML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);