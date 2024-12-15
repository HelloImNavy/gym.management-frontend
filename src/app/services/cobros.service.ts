import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cobro } from '../models/cobro.model'; 

@Injectable({
  providedIn: 'root', 
})
export class CobrosService {
  private apiUrl = 'http://localhost:8080/cobros';

  constructor(private http: HttpClient) {}

  getCobros(): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(this.apiUrl);
  }
  
  addCobro(cobro: Cobro): Observable<Cobro> {
    return this.http.post<Cobro>(this.apiUrl, cobro);
  }

  filterCobros(params: any): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(`${this.apiUrl}`, { params });
  }

  getCobrosPendientes(): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(`${this.apiUrl}/pendientes`);
  }

  getMiembros(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/miembros');
  }

  pagarCobro(cobroId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${cobroId}/pagar`, {});
  }
}
