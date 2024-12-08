export interface Actividad {
    id: number;         // Opcional, porque podría no estar definido al crear una nueva actividad
    nombre: string;      // Nombre de la actividad
    costo: number;       // Costo de la actividad
    cupoUsado: number;   // Número de cupos ya ocupados
    cupoTotal: number;   // Número total de cupos disponibles
  }
  