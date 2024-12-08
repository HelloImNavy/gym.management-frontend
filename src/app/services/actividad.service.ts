import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../models/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = 'http://localhost:8080/actividades';

  constructor(private http: HttpClient) {}

  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.apiUrl);
  }

  getActividad(id: string): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/${id}`);
  }

  deleteActividad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  saveActividad(actividad: any): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.apiUrl}`, actividad);
  }

  updateActividad(actividad: any): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/${actividad.id}`, actividad);
  }
}
