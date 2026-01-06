
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const mainConfig = {
  apiKey: "AIzaSyC614bGqnYf4Q-weTNemzWENTpa8DjGeHw",
  authDomain: "mzj-agenda.firebaseapp.com",
  projectId: "mzj-agenda",
  storageBucket: "mzj-agenda.firebasestorage.app",
  messagingSenderId: "834700407721",
  appId: "1:834700407721:web:75c17665d4f032fd65cab8"
};

const trackingConfig = {
  apiKey: "AIzaSyCorGtT5_Z68jCtLODvqnv0Fb7QW5eR6MQ",
  authDomain: "mzj-tracking.firebaseapp.com",
  projectId: "mzj-tracking",
  storageBucket: "mzj-tracking.firebasestorage.app",
  messagingSenderId: "655452217491",
  appId: "1:655452217491:web:9348d172c47bdd411fad66"
};

const mainApp = getApps().length === 0 ? initializeApp(mainConfig) : getApp();
const trackingApp = getApps().length === 1 ? initializeApp(trackingConfig, 'tracking') : getApp('tracking');

export const auth = getAuth(mainApp);
export const db = getFirestore(mainApp);

export const trackingAuth = getAuth(trackingApp);
export const trackingDb = getFirestore(trackingApp);

export default mainApp;
