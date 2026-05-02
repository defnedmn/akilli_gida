import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyInfjHdMPXc3ijA8oktBP9RAnpcPc9vE",
  authDomain: "saglikpusula.firebaseapp.com",
  projectId: "saglikpusula",
  storageBucket: "saglikpusula.firebasestorage.app",
  messagingSenderId: "100852591376",
  appId: "1:100852591376:web:418bbd160a7e3d15de1395",
  measurementId: "G-Y30WKGB2EN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);