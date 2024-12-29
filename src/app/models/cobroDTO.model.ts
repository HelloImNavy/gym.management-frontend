export interface DTOCobro {
  id?: number; // ID del cobro
  miembro: {
    id: number;
    nombre?: string; // Opcional según lo necesites
    apellidos?: string; // Opcional según lo necesites
  };
  inscripcion?: {
    id: number;
    actividad?: {
      id: number;
      nombre?: string;
    };
    fechaAlta?: string;
    fechaBaja?: string;
  };
  concepto: string; // Descripción del cobro
  fecha: string; // Fecha del cobro (formato ISO)
  estado: string; // Estado del cobro (ejemplo: PENDIENTE, PAGADO)
  fechaPago?: string; // Fecha de pago si ya fue realizado
  monto: number; // Monto del cobro
}
