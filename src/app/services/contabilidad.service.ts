import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContabilidadService {
  private apiUrl = 'http://localhost:8080/cobros/pagado';

  constructor(private http: HttpClient) { }

  // Método para obtener el total de cobros de un mes y año específicos

  getCobrosPagadosAnio(anio: number): Observable<{ fecha: string, monto: number }[]> {
    const params = new HttpParams()
      .set('anio', anio.toString());

    return this.http.get<any>(this.apiUrl + '/anio', { params }).pipe(
      map(cobros =>
        cobros.map((cobro: { fecha: any; monto: any }) => ({
          fecha: cobro.fecha,
          monto: cobro.monto
        }))
      )
    );
  }

}
