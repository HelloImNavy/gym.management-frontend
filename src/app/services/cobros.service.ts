import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CobroDTO } from '../models/cobro.model';
import { DTOCobro } from '../models/cobroDTO.model';


@Injectable({
  providedIn: 'root',
})
export class CobrosService {
  private apiUrl = 'http://localhost:8080/cobros';

  constructor(private http: HttpClient) { }

  getCobros(): Observable<CobroDTO[]> {
    return this.http.get<CobroDTO[]>(this.apiUrl);
  }

  addCobro(cobro: CobroDTO): Observable<CobroDTO> {
    return this.http.post<CobroDTO>(this.apiUrl, cobro);
  }

  addCobroMiembro(cobro: DTOCobro): Observable<DTOCobro> {
    return this.http.post<DTOCobro>(this.apiUrl, cobro);
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

  deleteCobro(cobroId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${cobroId}`, { responseType: 'text' as 'json' });
  }

  getCobrosPorMiembro(miembroId: number): Observable<CobroDTO[]> {
    return this.http.get<CobroDTO[]>(`${this.apiUrl}/miembro/${miembroId}`);
  }

  getCobrosPagadosAnio(anio: number): Observable<{ fecha: string, monto: number }[]> {
    const params = new HttpParams()
      .set('anio', anio.toString());

    return this.http.get<any>(this.apiUrl + '/pagado' + '/anio', { params }).pipe(
      map(cobros =>
        cobros.map((cobro: { fechaPago: any; monto: any }) => ({
          fecha: cobro.fechaPago,
          monto: cobro.monto
        }))
      )
    );
  }

}
