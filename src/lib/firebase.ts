import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtb8-fiq0JfrFHYCFyAcQ8_FvCJiRk22o",
  authDomain: "kipflix-1e04d.firebaseapp.com",
  projectId: "kipflix-1e04d",
  storageBucket: "kipflix-1e04d.firebasestorage.app",
  messagingSenderId: "736746135084",
  appId: "1:736746135084:web:341faba5e273122ca87b89",
  measurementId: "G-BYC1JEF0SF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);