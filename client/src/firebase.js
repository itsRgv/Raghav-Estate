// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "raghav-estate.firebaseapp.com",
  projectId: "raghav-estate",
  storageBucket: "raghav-estate.appspot.com",
  messagingSenderId: "373343485195",
  appId: "1:373343485195:web:263eac32a70fae7c51b60e",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
