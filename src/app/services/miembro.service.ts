import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Miembro } from '../models/miembro.model';

@Injectable({
  providedIn: 'root'
})
export class MiembroService {
  private apiUrl = 'http://localhost:8080/miembros';
  private actividadesUrl = 'http://localhost:8080/actividades';

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
    return this.http.put<Miembro>(`${this.apiUrl}/${id}`, miembro);
  }

  eliminarMiembro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerActividades(): Observable<any[]> {
    return this.http.get<any[]>(this.actividadesUrl);
  }

  darDeBajaMiembro(id: number, fechaBaja: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { fechaBaja });
  }

  // Métodos adicionales
  getHistorialAltasBajas(idMiembro: number): Observable<{ fechaAlta: string; fechaBaja?: string }[]> {
    return this.http.get<{ fechaAlta: string; fechaBaja?: string }[]>(`${this.apiUrl}/${idMiembro}/historial`);
  }

  getActividadesInscritas(idMiembro: number): Observable<{ nombre: string }[]> {
    return this.http.get<{ nombre: string }[]>(`${this.apiUrl}/${idMiembro}/actividades-inscritas`);
  }

  getActividadesNoRealizadas(idMiembro: number): Observable<{ nombre: string }[]> {
    return this.http.get<{ nombre: string }[]>(`${this.apiUrl}/${idMiembro}/actividades-no-realizadas`);
  }

  getCobros(idMiembro: number, ano: number): Observable<{ mes: string; pagado: boolean; fechaPago?: string }[]> {
    return this.http.get<{ mes: string; pagado: boolean; fechaPago?: string }[]>(
      `${this.apiUrl}/${idMiembro}/cobros?año=${ano}`
    );
  }
}
