export interface Cobro {
    id: number; 
    miembro: {
      id: number; 
      nombre: string;
      apellidos: string;
    };
    concepto: string; 
    fecha: string;
    estado: string; 
    monto: number;
    fechaPago?: string; 
  }
  