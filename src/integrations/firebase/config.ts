import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCbcz0-6MnqyCdXOAlcEX_7gqIzb_CrR6w',
  authDomain: 'learnr-394d2.firebaseapp.com',
  projectId: 'learnr-394d2',
  storageBucket: 'learnr-394d2.firebasestorage.app',
  messagingSenderId: '852650456242',
  appId: '1:852650456242:web:3e19feb044af736246c5ab',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
