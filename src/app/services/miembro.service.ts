import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Miembro } from '../models/miembro.model';
import { Actividad } from '../models/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class MiembroService {
  private apiUrl = 'http://localhost:8080/miembros';
  private actividadesUrl = 'http://localhost:8080/actividades';
  private inscripcionesUrl = 'http://localhost:8080/inscripciones';
  private cobrosUrl = 'http://localhost:8080/cobros';

  constructor(private http: HttpClient) {}

  getMiembros(): Observable<Miembro[]> {
    return this.http.get<Miembro[]>(this.apiUrl);
  }

  getMiembro(id: number): Observable<Miembro> {
    return this.http.get<Miembro>(`${this.apiUrl}/${id}`);
  }

  crearMiembro(miembro: Miembro): Observable<Miembro> {
    return this.http.post<Miembro>(this.apiUrl, miembro);
  }

  actualizarMiembro(id: number, miembro: Miembro): Observable<Miembro> {
    return this.http.put<Miembro>(`${this.apiUrl}/actualizar/${id}`, miembro);
  }
  
  getDetallesMiembro(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }  

  eliminarMiembro(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  obtenerActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.actividadesUrl);
  }

  darDeBajaMiembro(id: number, fechaBaja: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/baja`, { fechaBaja });
  }
  

  getActividadesInscritas(idMiembro: number): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.inscripcionesUrl}/actividades/${idMiembro}`);
  }

  getCobros(idMiembro: number, ano: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.cobrosUrl}/cobros/${idMiembro}`);
  }

  crearInscripciones(inscripciones: any[]): Observable<any> {
    const inscripcionesDTO = inscripciones.map(inscripcion => ({
      idMiembro: inscripcion.miembro.id,
      idActividad: inscripcion.actividad.id,
      fechaAlta: inscripcion.fechaAlta
    }));

    return this.http.post(this.inscripcionesUrl, inscripcionesDTO);
  }

  getHistorialAltasBajas(idMiembro: number): Observable<{ fechaAlta: string; fechaBaja?: string }[]> {
    return this.http.get<{ fechaAlta: string; fechaBaja?: string }[]>(`${this.inscripcionesUrl}/historial/${idMiembro}`);
  }

  darDeBajaActividad(miembroId: number, actividadId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${miembroId}/baja?actividadId=${actividadId}`, {});
  }

  inscribirEnActividad(miembroId: number, actividadId: number): Observable<void> {
    return this.http.post<void>(`${this.inscripcionesUrl}`, { miembroId, actividadId });
  }

  getActividadesDisponibles(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.actividadesUrl}/disponibles`);
  }
}
