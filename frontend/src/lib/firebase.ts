import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAozQFwOdRW381p1NJfWQewJSmo5_A9K8M",
  authDomain: "asiatiger-d8136.firebaseapp.com",
  projectId: "asiatiger-d8136",
  storageBucket: "asiatiger-d8136.firebasestorage.app",
  messagingSenderId: "1014505988972",
  appId: "1:1014505988972:web:b109ca9da2bacacb12c949"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;