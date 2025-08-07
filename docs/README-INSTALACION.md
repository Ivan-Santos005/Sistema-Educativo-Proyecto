# 📚 Sistema de Gestión Educativa

Sistema web para gestión de calificaciones educativas con tres tipos de usuario: Administrador, Docente y Alumno.

## 🚀 Características Principales

- **Login seguro** con Firebase Authentication
- **Dashboard Administrador**: CRUD de usuarios, materias y asignaciones
- **Dashboard Docente**: Captura de calificaciones por tipo (SER, SABER SER, SABER)
- **Dashboard Alumno**: Consulta de calificaciones personales
- **Responsive Design**: Adaptable a móviles y desktop
- **Tiempo Real**: Sincronización con Firebase Firestore

## 📁 Estructura de Archivos

```
proyecto/
├── login.html                 # Página de inicio de sesión
├── registro.html             # Página de registro de usuarios
├── admin-dashboard.html      # Panel de administración
├── docente-dashboard.html    # Panel de docentes
├── alumno-dashboard.html     # Panel de alumnos
├── js/
│   ├── firebase-config.js    # Configuración de Firebase
│   └── auth.js              # Utilidades de autenticación
├── assets/
│   ├── logouniversidad.png   # Logo de la universidad
│   └── imagenalumno.png     # Imagen de perfil
└── firebase-data-structure.json # Estructura de datos de ejemplo
```

## ⚙️ Configuración de Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "sistema-educativo")
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

### 2. Configurar Authentication

1. En el menú lateral, ve a **Authentication** > **Get started**
2. En la pestaña **Sign-in method**, habilita:
   - **Email/Password**
3. En **Settings** > **Authorized domains**, asegúrate de que tu dominio esté autorizado

### 3. Configurar Firestore Database

1. Ve a **Firestore Database** > **Create database**
2. Selecciona **Start in test mode** (cambiaremos las reglas después)
3. Elige una ubicación cercana a tu región

### 4. Obtener Configuración del Proyecto

1. Ve a **Project Settings** (ícono de engranaje)
2. En la sección **Your apps**, haz clic en **Web app** (</>)
3. Registra tu app con un nombre
4. Copia la configuración que aparece

### 5. Configurar el Código

Edita el archivo `js/firebase-config.js` y reemplaza la configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id-real"
};
```

## 🔒 Reglas de Seguridad de Firestore

Reemplaza las reglas en **Firestore Database** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
    }
    
    // Reglas para calificaciones
    match /calificaciones/{cursoId}/estudiantes/{estudianteId} {
      allow read: if request.auth != null && 
        (request.auth.uid == estudianteId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'DOCENTE']);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'DOCENTE'];
    }
  }
}
```

## 🗃️ Estructura de Datos

### Colecciones en Firestore:

1. **users**: Información de usuarios
2. **materias**: Catálogo de materias/asignaturas  
3. **asignaciones**: Relación docente-materia-grupo
4. **inscripciones**: Relación alumno-materia-grupo
5. **calificaciones**: Calificaciones por curso

Ver ejemplos detallados en `firebase-data-structure.json`

## 📊 Datos de Ejemplo

### Crear Usuario Administrador Inicial

1. Ejecuta el registro desde `registro.html`
2. Crea un usuario con rol **ADMIN**
3. Usa este usuario para gestionar el sistema

### Datos de Prueba

Puedes crear estos datos desde el panel de administración:

**Materias de Ejemplo:**
- Física I (FIS101)
- Matemáticas I (MAT101) 
- Simulación 3D (SIM3D)

**Usuarios de Ejemplo:**
- Admin: admin@universidad.edu.mx
- Docente: docente@universidad.edu.mx
- Alumno: alumno@universidad.edu.mx

## 🌐 Despliegue

### Desarrollo Local
1. Usa un servidor HTTP local (no abras directamente los archivos HTML)
2. Opciones recomendadas:
   - **Live Server** (VS Code Extension)
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx serve .`

### Producción
- **Firebase Hosting** (recomendado)
- **Netlify**
- **Vercel**
- **GitHub Pages**

### Comandos para Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 👥 Tipos de Usuario

### 🔧 Administrador
- Gestión completa de usuarios
- CRUD de materias y asignaciones
- Asignación de docentes a materias
- Control total del sistema

### 👨‍🏫 Docente  
- Ver materias asignadas
- Capturar calificaciones por tipo:
  - **SER**: Asistencia
  - **SABER SER**: Responsabilidad, Disposición
  - **SABER**: Conocimientos
- Guardar cambios en tiempo real

### 🎓 Alumno
- Ver materias inscritas
- Consultar calificaciones por unidad
- Resumen de evaluaciones
- Solo lectura

## 🔍 Solución de Problemas

### Error de CORS
- Usa un servidor HTTP local
- No abras archivos directamente en el navegador

### Error de Firebase
- Verifica la configuración en `firebase-config.js`
- Revisa las reglas de Firestore
- Confirma que Authentication esté habilitado

### Usuarios no pueden registrarse
- Verifica que Email/Password esté habilitado en Authentication
- Revisa las reglas de Firestore

### Calificaciones no se guardan
- Verifica que el usuario tenga rol DOCENTE o ADMIN
- Revisa las reglas de seguridad
- Confirma la estructura de datos

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop**: Experiencia completa
- **Tablet**: Navegación adaptada
- **Móvil**: Interfaz táctil optimizada

## 🔐 Seguridad

- Autenticación obligatoria
- Roles y permisos diferenciados
- Reglas de Firestore restrictivas
- Validación en frontend y backend

## 📞 Soporte

Para problemas técnicos:
1. Verifica la configuración de Firebase
2. Revisa la consola del navegador para errores
3. Confirma la estructura de datos
4. Valida las reglas de seguridad

## 🎯 Próximas Mejoras

- [ ] Exportación de calificaciones a Excel
- [ ] Notificaciones en tiempo real
- [ ] Reportes gráficos de rendimiento
- [ ] Sistema de períodos académicos
- [ ] Backup automático de datos

---
## 📄 Licencia

Este proyecto es de uso educativo. Puedes modificarlo según tus necesidades.