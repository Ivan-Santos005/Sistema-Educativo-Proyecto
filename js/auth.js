// Archivo de utilidades de autenticación
import { auth, db } from './firebase-config.js';
import { 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Verificar si el usuario está autenticado y tiene el rol correcto
export async function checkAuthAndRole(requiredRole) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'login.html';
        resolve(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === requiredRole) {
            resolve({ user, userData });
          } else {
            alert('No tienes permisos para acceder a esta página');
            window.location.href = 'login.html';
            resolve(false);
          }
        } else {
          alert('Usuario no encontrado en la base de datos');
          window.location.href = 'login.html';
          resolve(false);
        }
      } catch (error) {
        console.error('Error verificando usuario:', error);
        window.location.href = 'login.html';
        resolve(false);
      }
    });
  });
}

// Cerrar sesión
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión');
  }
}

// Crear usuario con rol
export async function createUserWithRole(email, password, userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardar datos adicionales del usuario
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      nombre: userData.nombre,
      role: userData.role,
      numeroControl: userData.numeroControl,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error creando usuario:', error);
    return { success: false, error: error.message };
  }
}

// Obtener datos del usuario actual
export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    return null;
  }
}