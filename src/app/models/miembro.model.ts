export interface Miembro {
  id?: number;
  nombre: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  fechaNacimiento: string;
  fechaAlta: string;
  fechaBaja?: string;
  observaciones: string;
  actividades: any[];
}


export interface Inscripcion {
  actividadId: number;  // ID de la actividad
  fechaAlta: string;    // Fecha de alta (en formato string o LocalDate)
  fechaBaja?: string;   // Fecha de baja (opcional)
}
