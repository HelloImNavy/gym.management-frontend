import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  private apiUrl = 'http://localhost:8080/pagos'; // Cambiar según la URL del backend

  constructor(private http: HttpClient) {}

  obtenerCobrosPorNombreYFechas(
    nombreSocio: string, 
    apellidosSocio: string, 
    fechaInicio: string, 
    fechaFin: string
  ): Observable<any[]> {
    let params = new HttpParams();

    if (nombreSocio) {
      params = params.set('nombreSocio', nombreSocio);
    }
    if (apellidosSocio) {
      params = params.set('apellidosSocio', apellidosSocio);
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params });
  }

  obtenerSociosPorNombre(nombreSocio: string): Observable<any[]> {
    let params = new HttpParams();
    if (nombreSocio) {
      params = params.set('nombreSocio', nombreSocio); 
    }
    return this.http.get<any[]>(`${this.apiUrl}/buscarSocios`, { params });
  }

  crearCobro(cobro: any): Observable<any> {
    return this.http.post(this.apiUrl, cobro);
  }

  actualizarCobro(cobro: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cobro.id}`, cobro);
  }

  eliminarCobro(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
