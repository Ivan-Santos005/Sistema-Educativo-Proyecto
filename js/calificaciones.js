// Módulo de gestión de calificaciones
import { db } from './firebase-config.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Estructura de calificaciones por tipo de evaluación
const CRITERIOS_EVALUACION = {
  'asistencia': ['asistencia'],
  'actitudes': ['responsabilidad', 'disposicion'],
  'conocimientos': ['conocimientos']
};

/**
 * Obtener estudiantes inscritos en una materia específica
 */
export async function getEstudiantesMateria(materiaId, grupo) {
  try {
    console.log('Buscando estudiantes para:', { materiaId, grupo });
    
    // Buscar inscripciones
    const inscripcionesQuery = query(
      collection(db, 'inscripciones'),
      where('materiaId', '==', materiaId),
      where('grupo', '==', grupo)
    );
    
    const inscripcionesSnapshot = await getDocs(inscripcionesQuery);
    const estudiantes = [];
    
    for (const inscripcionDoc of inscripcionesSnapshot.docs) {
      const inscripcion = inscripcionDoc.data();
      
      // Obtener datos del estudiante
      const estudianteDoc = await getDoc(doc(db, 'users', inscripcion.alumnoId));
      
      if (estudianteDoc.exists()) {
        estudiantes.push({
          id: inscripcion.alumnoId,
          ...estudianteDoc.data()
        });
      }
    }
    
    console.log('Estudiantes encontrados:', estudiantes);
    return estudiantes;
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    return [];
  }
}

/**
 * Obtener calificaciones existentes de un curso
 */
export async function getCalificacionesCurso(materiaInfo, grupo) {
  try {
    const cursoId = `curso_${materiaInfo.codigo}_${grupo}`;
    console.log('Obteniendo calificaciones para curso:', cursoId);
    
    const cursoDoc = await getDoc(doc(db, 'calificaciones', cursoId));
    
    if (cursoDoc.exists()) {
      const data = cursoDoc.data();
      console.log('Calificaciones encontradas:', data);
      return data.estudiantes || {};
    }
    
    console.log('No se encontraron calificaciones para el curso');
    return {};
  } catch (error) {
    console.error('Error obteniendo calificaciones:', error);
    return {};
  }
}

/**
 * Guardar calificaciones en Firebase
 */
export async function guardarCalificaciones(materiaInfo, grupo, calificaciones, docenteId) {
  try {
    const cursoId = `curso_${materiaInfo.codigo}_${grupo}`;
    console.log('Guardando calificaciones para curso:', cursoId);
    console.log('Datos a guardar:', calificaciones);
    
    const cursoData = {
      estudiantes: calificaciones,
      metadata: {
        docenteId: docenteId,
        materiaId: materiaInfo.id || 'unknown',
        materiaCodigo: materiaInfo.codigo,
        materiaNombre: materiaInfo.nombre,
        grupo: grupo,
        periodo: '2025-1',
        lastUpdated: new Date().toISOString()
      }
    };
    
    await setDoc(doc(db, 'calificaciones', cursoId), cursoData);
    console.log('Calificaciones guardadas exitosamente');
    
    return { success: true };
  } catch (error) {
    console.error('Error guardando calificaciones:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generar tabla de calificaciones para un tipo de evaluación
 */
export function generarTablaCalificaciones(estudiantes, unidades, tipoEvaluacion, calificacionesExistentes = {}) {
  const criterios = CRITERIOS_EVALUACION[tipoEvaluacion] || ['calificacion'];
  
  console.log('Generando tabla para:', { tipoEvaluacion, criterios, estudiantes: estudiantes.length });
  
  let html = '<thead><tr>';
  
  // Encabezado: Alumno + Unidades + Total
  html += '<th style="min-width: 200px;">Alumno</th>';
  html += '<th style="min-width: 100px;">No. Control</th>';
  
  // Encabezados de unidades con criterios
  unidades.forEach((unidad, unidadIndex) => {
    html += `<th colspan="${criterios.length}" style="background: #8FBC8F; color: white;">${unidad}</th>`;
  });
  
  html += '<th style="background: #E8DCC6;">TOTAL</th></tr>';
  
  // Sub-encabezados de criterios
  html += '<tr><th></th><th></th>';
  unidades.forEach(() => {
    criterios.forEach(criterio => {
      const nombreCriterio = criterio.charAt(0).toUpperCase() + criterio.slice(1);
      html += `<th style="background: #B8C892; color: white; font-size: 12px;">${nombreCriterio}</th>`;
    });
  });
  html += '<th style="background: #E8DCC6;">PUNTOS</th></tr></thead>';
  
  // Cuerpo de la tabla
  html += '<tbody>';
  
  estudiantes.forEach(estudiante => {
    html += `<tr data-estudiante-id="${estudiante.id}">`;
    html += `<td style="background: #6B8E6B; color: white; font-weight: bold;">${estudiante.nombre}</td>`;
    html += `<td>${estudiante.numeroControl}</td>`;
    
    let totalEstudiante = 0;
    
    // Generar celdas para cada unidad y criterio
    unidades.forEach((unidad, unidadIndex) => {
      criterios.forEach(criterio => {
        const calificacionValue = getCalificacionValue(
          calificacionesExistentes, 
          estudiante.id, 
          unidadIndex, 
          criterio
        );
        
        totalEstudiante += calificacionValue;
        
        html += `
          <td>
            <input type="number" 
                   min="0" 
                   max="10" 
                   value="${calificacionValue}"
                   class="calificacion-input"
                   data-estudiante="${estudiante.id}"
                   data-unidad="${unidadIndex}"
                   data-criterio="${criterio}"
                   style="width: 60px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 3px;"
                   onchange="actualizarTotal('${estudiante.id}')">
          </td>
        `;
      });
    });
    
    html += `<td class="total-estudiante" id="total-${estudiante.id}" style="background: #E8DCC6; font-weight: bold; text-align: center;">${totalEstudiante}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody>';
  
  return html;
}

/**
 * Obtener valor de calificación específica
 */
function getCalificacionValue(calificaciones, estudianteId, unidadIndex, criterio) {
  try {
    const unidadKey = `unidad_${unidadIndex}`;
    return calificaciones[estudianteId]?.unidades?.[unidadKey]?.[criterio] || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Actualizar total de un estudiante (función global)
 */
window.actualizarTotal = function(estudianteId) {
  const inputs = document.querySelectorAll(`input[data-estudiante="${estudianteId}"]`);
  let total = 0;
  
  inputs.forEach(input => {
    const valor = parseInt(input.value) || 0;
    total += valor;
  });
  
  const totalElement = document.getElementById(`total-${estudianteId}`);
  if (totalElement) {
    totalElement.textContent = total;
  }
};

/**
 * Recopilar todas las calificaciones de la tabla actual
 */
export function recopilarCalificaciones() {
  const inputs = document.querySelectorAll('.calificacion-input');
  const calificaciones = {};
  
  inputs.forEach(input => {
    const estudianteId = input.dataset.estudiante;
    const unidadIndex = input.dataset.unidad;
    const criterio = input.dataset.criterio;
    const valor = parseInt(input.value) || 0;
    
    // Inicializar estructura si no existe
    if (!calificaciones[estudianteId]) {
      calificaciones[estudianteId] = {
        unidades: {}
      };
    }
    
    const unidadKey = `unidad_${unidadIndex}`;
    if (!calificaciones[estudianteId].unidades[unidadKey]) {
      calificaciones[estudianteId].unidades[unidadKey] = {};
    }
    
    calificaciones[estudianteId].unidades[unidadKey][criterio] = valor;
    calificaciones[estudianteId].lastUpdated = new Date().toISOString();
  });
  
  console.log('Calificaciones recopiladas:', calificaciones);
  return calificaciones;
}

/**
 * Validar calificaciones antes de guardar
 */
export function validarCalificaciones(calificaciones) {
  const errores = [];
  
  Object.entries(calificaciones).forEach(([estudianteId, data]) => {
    if (!data.unidades) {
      errores.push(`Estudiante ${estudianteId}: faltan unidades`);
      return;
    }
    
    Object.entries(data.unidades).forEach(([unidad, criterios]) => {
      Object.entries(criterios).forEach(([criterio, valor]) => {
        if (typeof valor !== 'number' || valor < 0 || valor > 10) {
          errores.push(`Estudiante ${estudianteId}, ${unidad}, ${criterio}: valor inválido (${valor})`);
        }
      });
    });
  });
  
  return errores;
}

/**
 * Mostrar notificación de estado
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
  const notification = document.createElement('div');
  notification.textContent = mensaje;
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
    background: ${tipo === 'error' ? '#f44336' : tipo === 'success' ? '#4caf50' : '#2196f3'};
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

/**
 * Exportar calificaciones a CSV (funcionalidad extra)
 */
export function exportarCalificacionesCSV(estudiantes, calificaciones, materiaInfo, grupo) {
  const headers = ['Estudiante', 'No. Control'];
  const data = [];
  
  // Agregar headers de unidades
  const unidades = materiaInfo.unidades || [];
  unidades.forEach(unidad => {
    headers.push(`${unidad}_SER`, `${unidad}_SABER_SER`, `${unidad}_SABER`);
  });
  headers.push('TOTAL');
  
  // Agregar datos de estudiantes
  estudiantes.forEach(estudiante => {
    const row = [estudiante.nombre, estudiante.numeroControl];
    let total = 0;
    
    unidades.forEach((unidad, index) => {
      const unidadKey = `unidad_${index}`;
      const unidadData = calificaciones[estudiante.id]?.unidades?.[unidadKey] || {};
      
      const ser = unidadData.asistencia || 0;
      const saberSer = (unidadData.responsabilidad || 0) + (unidadData.disposicion || 0);
      const saber = unidadData.conocimientos || 0;
      
      row.push(ser, saberSer, saber);
      total += ser + saberSer + saber;
    });
    
    row.push(total);
    data.push(row);
  });
  
  // Generar CSV
  let csvContent = headers.join(',') + '\n';
  data.forEach(row => {
    csvContent += row.join(',') + '\n';
  });
  
  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `calificaciones_${materiaInfo.codigo}_${grupo}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}