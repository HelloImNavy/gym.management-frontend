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
  actividadId: number; 
  fechaAlta: string;    
  fechaBaja?: string;  
}
