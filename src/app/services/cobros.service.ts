import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CobroDTO } from '../models/cobro.model'; 


@Injectable({
  providedIn: 'root', 
})
export class CobrosService {
  private apiUrl = 'http://localhost:8080/cobros';

  constructor(private http: HttpClient) {}

  getCobros(): Observable<CobroDTO[]> {
    return this.http.get<CobroDTO[]>(this.apiUrl);
  }
  
  addCobro(cobro: CobroDTO): Observable<CobroDTO> {
    return this.http.post<CobroDTO>(this.apiUrl, cobro);
  }

  filterCobros(params: any): Observable<CobroDTO[]> {
    return this.http.get<CobroDTO[]>(`${this.apiUrl}`, { params });
  }

  getCobrosPendientes(): Observable<CobroDTO[]> {
    return this.http.get<CobroDTO[]>(`${this.apiUrl}/pendientes`);
  }

  getMiembros(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/miembros');
  }

  pagarCobro(cobroId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${cobroId}/pagar`, {});
  }

  updateCobro(cobroId: number, cobro: CobroDTO): Observable<CobroDTO> {
    return this.http.put<CobroDTO>(`${this.apiUrl}/${cobroId}`, cobro);
  } 
    
  deleteCobro(cobroId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cobroId}`);
  }

  getCobrosPorMiembro(miembroId: number): Observable<CobroDTO[]> { 
    return this.http.get<CobroDTO[]>(`${this.apiUrl}/miembro/${miembroId}`); }


}
