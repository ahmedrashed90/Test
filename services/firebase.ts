
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC614bGqnYf4Q-weTNemzWENTpa8DjGeHw",
  authDomain: "mzj-agenda.firebaseapp.com",
  projectId: "mzj-agenda",
  storageBucket: "mzj-agenda.firebasestorage.app",
  messagingSenderId: "834700407721",
  appId: "1:834700407721:web:75c17665d4f032fd65cab8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
