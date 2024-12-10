// miembro-adaptador.service.ts
import { Injectable } from '@angular/core';
import { Miembro } from '../models/miembro.model'; 

@Injectable({
  providedIn: 'root',
})
export class MiembroAdaptadorService {

  adaptarMiembros(data: any): Miembro[] {
    return data.content.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      apellidos: item.apellidos,
      direccion: item.direccion || '',
      telefono: item.telefono || '',
      fechaNacimiento: item.fechaNacimiento || '',
      fechaAlta: item.fechaAlta || '',
      fechaBaja: item.fechaBaja || null,
      observaciones: item.observaciones || '',
      actividades: item.actividades || [],
      inscripciones: item.inscripciones || [],
    }));
  }
}
