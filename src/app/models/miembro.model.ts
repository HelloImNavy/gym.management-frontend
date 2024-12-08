export interface Miembro {
  id?: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  observaciones: string;
  inscripciones: Inscripcion[];  // Lista de inscripciones
}

export interface Inscripcion {
  actividadId: number;  // ID de la actividad
  fechaAlta: string;    // Fecha de alta (en formato string o LocalDate)
  fechaBaja?: string;   // Fecha de baja (opcional)
}
