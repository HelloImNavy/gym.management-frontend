export interface Inscripcion {
  id: number;
  idMiembro: number;  // ID del miembro
  idActividad: number; // ID de la actividad
  fechaInscripcion: string; // Fecha de inscripción
  fechaBaja?: string; // Fecha de baja (opcional)
  estado: 'activo' | 'inactivo'; // Estado de la inscripción
}
