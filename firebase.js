import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  getDoc, // Add getDoc here
  onSnapshot,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsZ4pj9ZnPfU_Dva02FfuyFJYGkNw0A6Q",
  authDomain: "ecos27.firebaseapp.com",
  projectId: "ecos27",
  storageBucket: "ecos27.appspot.com",
  messagingSenderId: "742511968993",
  appId: "1:742511968993:web:7536bd959125caa640eda0",
  measurementId: "G-272MV04LLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  getDoc ,
  onSnapshot,
  updateDoc,
  arrayUnion
};