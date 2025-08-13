// roles.js - Sistema de gestión de roles y permisos

/**
 * Definición de roles y sus permisos correspondientes
 */
export const ROLES = {
  POWERUSER: 'POWERUSER',
  ADMIN: 'ADMIN', 
  DOCENTE: 'DOCENTE',
  ALUMNO: 'ALUMNO'
};

/**
 * Configuración de permisos por rol
 */
export const rolePermissions = {
  [ROLES.POWERUSER]: {
    // Permisos de usuario
    canCreateRoles: [ROLES.POWERUSER, ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO],
    canEditAnyUser: true,
    canDeleteAnyUser: true,
    canViewAllUsers: true,
    
    // Permisos de sistema
    hasFullAccess: true,
    canAccessAdminPanel: true,
    canAccessDocentePanel: true,
    canAccessAlumnoPanel: true,
    
    // Permisos de gestión académica
    canManageSubjects: true,
    canManageAssignments: true,
    canManageEnrollments: true,
    canManageGrades: true,
    canViewAllGrades: true,
    
    // Permisos de exportación
    canExportData: true,
    canImportData: true,
    
    // Descripción del rol
    description: 'Acceso completo al sistema con todos los permisos',
    icon: '🔧',
    color: '#ff6b6b'
  },

  [ROLES.ADMIN]: {
    // Permisos de usuario
    canCreateRoles: [ROLES.DOCENTE, ROLES.ALUMNO],
    canEditAnyUser: false, // Solo usuarios que crearon
    canDeleteAnyUser: false, // Solo docentes y alumnos
    canViewAllUsers: true,
    
    // Permisos de sistema
    hasFullAccess: false,
    canAccessAdminPanel: true,
    canAccessDocentePanel: false,
    canAccessAlumnoPanel: false,
    
    // Permisos de gestión académica
    canManageSubjects: true,
    canManageAssignments: true,
    canManageEnrollments: true,
    canManageGrades: false, // No puede calificar
    canViewAllGrades: true, // Puede ver pero no editar
    
    // Permisos de exportación
    canExportData: true,
    canImportData: true,
    
    // Descripción del rol
    description: 'Administración de docentes, alumnos y configuración del sistema',
    icon: '👨‍💼',
    color: '#4ecdc4'
  },

  [ROLES.DOCENTE]: {
    // Permisos de usuario
    canCreateRoles: [ROLES.ALUMNO],
    canEditAnyUser: false, // Solo alumnos que gestiona
    canDeleteAnyUser: false, // Solo alumnos que creó
    canViewAllUsers: false, // Solo alumnos de sus materias
    
    // Permisos de sistema
    hasFullAccess: false,
    canAccessAdminPanel: false,
    canAccessDocentePanel: true,
    canAccessAlumnoPanel: false,
    
    // Permisos de gestión académica
    canManageSubjects: false,
    canManageAssignments: false,
    canManageEnrollments: false, // Solo puede ver inscripciones de sus materias
    canManageGrades: true, // Su función principal
    canViewAllGrades: false, // Solo de sus materias
    
    // Permisos de exportación
    canExportData: true, // Solo calificaciones de sus materias
    canImportData: false,
    
    // Descripción del rol
    description: 'Evaluaciones, calificaciones y gestión limitada de alumnos',
    icon: '👨‍🏫',
    color: '#6B8E6B'
  },

  [ROLES.ALUMNO]: {
    // Permisos de usuario
    canCreateRoles: [],
    canEditAnyUser: false,
    canDeleteAnyUser: false,
    canViewAllUsers: false,
    
    // Permisos de sistema
    hasFullAccess: false,
    canAccessAdminPanel: false,
    canAccessDocentePanel: false,
    canAccessAlumnoPanel: true,
    
    // Permisos de gestión académica
    canManageSubjects: false,
    canManageAssignments: false,
    canManageEnrollments: false,
    canManageGrades: false,
    canViewAllGrades: false, // Solo sus propias calificaciones
    
    // Permisos de exportación
    canExportData: false, // Solo sus propias calificaciones
    canImportData: false,
    
    // Descripción del rol
    description: 'Consulta de calificaciones y progreso académico personal',
    icon: '🎓',
    color: '#17a2b8'
  }
};

/**
 * Clase para gestión de roles y permisos
 */
export class RoleManager {
  constructor(userRole) {
    this.userRole = userRole;
    this.permissions = rolePermissions[userRole] || {};
  }

  /**
   * Verificar si el usuario puede crear un rol específico
   * @param {string} targetRole - Rol que se desea crear
   * @returns {boolean}
   */
  canCreateRole(targetRole) {
    return this.permissions.canCreateRoles?.includes(targetRole) || false;
  }

  /**
   * Verificar si el usuario puede editar otro usuario
   * @param {Object} targetUser - Usuario objetivo
   * @param {string} currentUserId - ID del usuario actual
   * @returns {boolean}
   */
  canEditUser(targetUser, currentUserId) {
    if (this.permissions.canEditAnyUser) return true;
    
    // Reglas específicas por rol
    switch (this.userRole) {
      case ROLES.ADMIN:
        // Admin puede editar docentes y alumnos, pero no otros admins o powerusers
        return ![ROLES.POWERUSER, ROLES.ADMIN].includes(targetUser.role);
      
      case ROLES.DOCENTE:
        // Docente solo puede editar alumnos
        return targetUser.role === ROLES.ALUMNO;
      
      default:
        return false;
    }
  }

  /**
   * Verificar si el usuario puede eliminar otro usuario
   * @param {Object} targetUser - Usuario objetivo
   * @returns {boolean}
   */
  canDeleteUser(targetUser) {
    if (this.permissions.canDeleteAnyUser) return true;
    
    switch (this.userRole) {
      case ROLES.ADMIN:
        return [ROLES.DOCENTE, ROLES.ALUMNO].includes(targetUser.role);
      
      case ROLES.DOCENTE:
        return targetUser.role === ROLES.ALUMNO;
      
      default:
        return false;
    }
  }

  /**
   * Obtener opciones de rol disponibles para crear usuarios
   * @returns {Array} Array de roles disponibles
   */
  getAvailableRoles() {
    return this.permissions.canCreateRoles || [];
  }

  /**
   * Verificar acceso a panel específico
   * @param {string} panel - Tipo de panel (admin, docente, alumno)
   * @returns {boolean}
   */
  canAccessPanel(panel) {
    const panelPermissions = {
      admin: this.permissions.canAccessAdminPanel,
      docente: this.permissions.canAccessDocentePanel,
      alumno: this.permissions.canAccessAlumnoPanel
    };
    
    return panelPermissions[panel] || false;
  }

  /**
   * Verificar si puede gestionar calificaciones
   * @returns {boolean}
   */
  canManageGrades() {
    return this.permissions.canManageGrades || false;
  }

  /**
   * Verificar si puede ver todas las calificaciones
   * @returns {boolean}
   */
  canViewAllGrades() {
    return this.permissions.canViewAllGrades || false;
  }

  /**
   * Verificar si puede exportar datos
   * @returns {boolean}
   */
  canExportData() {
    return this.permissions.canExportData || false;
  }

  /**
   * Obtener información del rol actual
   * @returns {Object}
   */
  getRoleInfo() {
    return {
      role: this.userRole,
      description: this.permissions.description,
      icon: this.permissions.icon,
      color: this.permissions.color,
      permissions: this.permissions
    };
  }
}

/**
 * Función para obtener el badge CSS class basado en el rol
 * @param {string} role - Rol del usuario
 * @returns {string}
 */
export function getRoleBadgeClass(role) {
  const badgeClasses = {
    [ROLES.POWERUSER]: 'role-poweruser',
    [ROLES.ADMIN]: 'role-admin',
    [ROLES.DOCENTE]: 'role-docente',
    [ROLES.ALUMNO]: 'role-alumno'
  };
  
  return badgeClasses[role] || '';
}

/**
 * Función para obtener el nombre amigable del rol
 * @param {string} role - Rol del usuario
 * @returns {string}
 */
export function getRoleDisplayName(role) {
  const roleNames = {
    [ROLES.POWERUSER]: 'Power User',
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.DOCENTE]: 'Docente',
    [ROLES.ALUMNO]: 'Alumno'
  };
  
  return roleNames[role] || role;
}

/**
 * Función para redireccionar basado en el rol
 * @param {string} role - Rol del usuario
 * @returns {string} URL de redirección
 */
export function getRedirectUrl(role) {
  const redirectUrls = {
    [ROLES.POWERUSER]: 'admin-dashboard.html',
    [ROLES.ADMIN]: 'admin-dashboard.html',
    [ROLES.DOCENTE]: 'docente-dashboard.html',
    [ROLES.ALUMNO]: 'alumno-dashboard.html'
  };
  
  return redirectUrls[role] || 'login.html';
}

/**
 * Función para verificar si el rol es válido
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Función para obtener todos los roles disponibles
 * @returns {Array}
 */
export function getAllRoles() {
  return Object.values(ROLES);
}

/**
 * Middleware para verificar permisos en rutas
 * @param {string} userRole - Rol del usuario actual
 * @param {string} requiredRole - Rol requerido para la acción
 * @returns {boolean}
 */
export function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    [ROLES.POWERUSER]: 4,
    [ROLES.ADMIN]: 3,
    [ROLES.DOCENTE]: 2,
    [ROLES.ALUMNO]: 1
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Función para obtener usuarios que un rol puede gestionar
 * @param {string} managerRole - Rol del gestor
 * @returns {Array}
 */
export function getManagedRoles(managerRole) {
  const manager = new RoleManager(managerRole);
  return manager.getAvailableRoles();
}

/**
 * Función utilitaria para mostrar mensajes de error de permisos
 * @param {string} action - Acción que se intentó realizar
 * @returns {string}
 */
export function getPermissionErrorMessage(action) {
  return `No tienes permisos suficientes para realizar esta acción: ${action}`;
}

/**
 * Configuración de notificaciones por rol
 */
export const roleNotifications = {
  [ROLES.POWERUSER]: {
    welcome: '¡Bienvenido, Power User! Tienes acceso completo al sistema.',
    restrictions: null
  },
  [ROLES.ADMIN]: {
    welcome: '¡Bienvenido, Administrador! Puedes gestionar docentes y alumnos.',
    restrictions: 'Recuerda: solo puedes crear usuarios DOCENTE y ALUMNO.'
  },
  [ROLES.DOCENTE]: {
    welcome: '¡Bienvenido, Docente! Puedes calificar y gestionar tus alumnos.',
    restrictions: 'Puedes crear nuevos alumnos y calificar a los estudiantes de tus materias.'
  },
  [ROLES.ALUMNO]: {
    welcome: '¡Bienvenido, Estudiante! Consulta tus calificaciones y progreso.',
    restrictions: null
  }
};

/**
 * Export por defecto con todas las funciones principales
 */
export default {
  ROLES,
  RoleManager,
  rolePermissions,
  getRoleBadgeClass,
  getRoleDisplayName,
  getRedirectUrl,
  isValidRole,
  getAllRoles,
  hasPermission,
  getManagedRoles,
  getPermissionErrorMessage,
  roleNotifications
};