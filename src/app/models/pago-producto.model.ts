export interface PagoProducto {
    nombreComprador: string;
    tipoComprador: 'socio' | 'externo';
    socioId?: number;
    productos: string;
    importeTotal: number;
    fechaPago: string;
    estado: 'Pendiente' | 'Pagado';
  }
  