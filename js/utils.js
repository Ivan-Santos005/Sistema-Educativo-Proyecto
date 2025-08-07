// Utilidades generales para el sistema educativo

// Formatear fechas
export function formatDate(date, format = 'dd/mm/yyyy') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  switch(format) {
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    case 'mm/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`;
    case 'dd/mm/yyyy hh:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return d.toLocaleDateString();
  }
}

// Validar email
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar número de control
export function validateNumeroControl(numeroControl) {
  // Acepta formatos: 12345678, DOC001, ADMIN001
  const regex = /^[A-Z0-9]{3,15}$/;
  return regex.test(numeroControl.toUpperCase());
}

// Validar contraseña
export function validatePassword(password) {
  return {
    isValid: password.length >= 6,
    hasMinLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
}

// Generar ID único
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${randomStr}`;
}

// Calcular promedio de calificaciones
export function calculateAverage(calificaciones) {
  if (!calificaciones || Object.keys(calificaciones).length === 0) {
    return 0;
  }
  
  let suma = 0;
  let count = 0;
  
  Object.values(calificaciones).forEach(unidad => {
    if (unidad && typeof unidad === 'object') {
      Object.values(unidad).forEach(calificacion => {
        if (typeof calificacion === 'number') {
          suma += calificacion;
          count++;
        }
      });
    }
  });
  
  return count > 0 ? (suma / count).toFixed(2) : 0;
}

// Obtener color según calificación
export function getGradeColor(calificacion) {
  if (calificacion >= 9) return '#4caf50'; // Verde
  if (calificacion >= 8) return '#8bc34a'; // Verde claro
  if (calificacion >= 7) return '#ffeb3b'; // Amarillo
  if (calificacion >= 6) return '#ff9800'; // Naranja
  return '#f44336'; // Rojo
}

// Obtener estado según calificación
export function getGradeStatus(calificacion) {
  if (calificacion >= 7) return 'Aprobado';
  if (calificacion >= 6) return 'Regular';
  return 'Reprobado';
}

// Capitalizar primera letra
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formatear nombre completo
export function formatFullName(nombre) {
  return nombre
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

// Mostrar mensaje de notificación
export function showNotification(message, type = 'info', duration = 3000) {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    transition: all 0.3s ease;
    transform: translateX(100%);
    opacity: 0;
  `;
  
  // Colores según tipo
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 100);
  
  // Remover después del tiempo especificado
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Confirmar acción
export function confirmAction(message, onConfirm, onCancel = null) {
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  content.innerHTML = `
    <p style="margin-bottom: 20px; font-size: 16px; color: #333;">${message}</p>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="confirmBtn" style="
        padding: 10px 20px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      ">Confirmar</button>
      <button id="cancelBtn" style="
        padding: 10px 20px;
        background: #666;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      ">Cancelar</button>
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Event listeners
  content.querySelector('#confirmBtn').onclick = () => {
    document.body.removeChild(modal);
    if (onConfirm) onConfirm();
  };
  
  content.querySelector('#cancelBtn').onclick = () => {
    document.body.removeChild(modal);
    if (onCancel) onCancel();
  };
  
  // Cerrar al hacer clic fuera
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      if (onCancel) onCancel();
    }
  };
}

// Manejar errores de forma consistente
export function handleError(error, context = '') {
  console.error(`Error en ${context}:`, error);
  
  let userMessage = 'Ha ocurrido un error inesperado';
  
  if (error.code) {
    switch(error.code) {
      case 'auth/user-not-found':
        userMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        userMessage = 'Contraseña incorrecta';
        break;
      case 'auth/email-already-in-use':
        userMessage = 'Este correo ya está registrado';
        break;
      case 'auth/weak-password':
        userMessage = 'La contraseña es muy débil';
        break;
      case 'auth/network-request-failed':
        userMessage = 'Error de conexión. Verifica tu internet';
        break;
      case 'permission-denied':
        userMessage = 'No tienes permisos para realizar esta acción';
        break;
      default:
        userMessage = error.message || userMessage;
    }
  }
  
  showNotification(userMessage, 'error');
  return userMessage;
}

// Debounce para optimizar búsquedas
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Exportar datos a CSV
export function exportToCSV(data, filename = 'datos.csv') {
  if (!data || data.length === 0) {
    showNotification('No hay datos para exportar', 'warning');
    return;
  }
  
  // Obtener headers
  const headers = Object.keys(data[0]);
  
  // Crear contenido CSV
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escapar comillas y agregar comillas si contiene comas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    });
    csvContent += values.join(',') + '\n';
  });
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  showNotification('Archivo exportado exitosamente', 'success');
}

// Validar archivo subido
export function validateFile(file, allowedTypes = [], maxSize = 5242880) { // 5MB por defecto
  const errors = [];
  
  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return { isValid: false, errors };
  }
  
  // Validar tipo
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
  }
  
  // Validar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    errors.push(`El archivo es muy grande. Tamaño máximo: ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Formatear tamaño de archivo
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Obtener información del dispositivo
export function getDeviceInfo() {
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
    isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform
  };
}