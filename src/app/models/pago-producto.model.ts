export interface PagoProducto {
  id?: number;
  nombreComprador: string;
  tipoComprador: 'socio' | 'externo';
  socioId?: number;
  productos: string[];
  importeTotal: number;
  fechaPago: string;
  estado: 'Pendiente' | 'Pagado';
  observaciones?: string;
}
