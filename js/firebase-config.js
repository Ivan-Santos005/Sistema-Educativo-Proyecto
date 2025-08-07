// Configuración de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBlHUNRxqpo5nCkZTre4aVxFNNeHFIhKXY",
  authDomain: "sistema-educativo-ce026.firebaseapp.com",
  projectId: "sistema-educativo-ce026",
  storageBucket: "sistema-educativo-ce026.firebasestorage.app",
  messagingSenderId: "490967373967",
  appId: "1:490967373967:web:e7cb4aa8cf0ed6d851b8fa",
  measurementId: "G-4Y7NKJBNLL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Función para obtener el usuario actual y su rol
export async function getCurrentUserRole() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() ? userDoc.data().role : null;
  } catch (error) {
    console.error('Error obteniendo rol del usuario:', error);
    return null;
  }
}

// Función para verificar autenticación
export function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}