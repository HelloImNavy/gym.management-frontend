export interface Inscripcion {
    id: number;
    miembroId: number;  // ID del miembro
    actividadId: number; // ID de la actividad
    fechaInscripcion: string; // Fecha de inscripción
    fechaBaja?: string; // Fecha de baja (opcional)
    estado: 'activo' | 'inactivo'; // Estado de la inscripción
  }
  