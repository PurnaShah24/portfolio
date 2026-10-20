// Import the functions you need from the SDKs you need (using CDN for native browser ES modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeANikOjwEvLErowZx1oP4hP6LGnvj8dE",
  authDomain: "portfolio-43ffd.firebaseapp.com",
  projectId: "portfolio-43ffd",
  storageBucket: "portfolio-43ffd.firebasestorage.app",
  messagingSenderId: "1094048047574",
  appId: "1:1094048047574:web:fb7b345a36c1d932b04477",
  measurementId: "G-ZZD42XXV26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => null);
}

export { app, auth, db, storage, analytics };

