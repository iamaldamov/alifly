import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuWhl7D_1pNBEbjh5YR_rY8RTfMZ48R0Y",
  authDomain: "alifly.firebaseapp.com",
  projectId: "alifly",
  storageBucket: "alifly.firebasestorage.app",
  messagingSenderId: "494936616984",
  appId: "1:494936616984:web:cd60f9443fc34a65f5d36d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
