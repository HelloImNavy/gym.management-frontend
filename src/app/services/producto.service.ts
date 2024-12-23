import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoProducto } from '../models/pago-producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/productos';
  private pagosProductosUrl = 'http://localhost:8080/productos/pagos'; // URL para pagos

  constructor(private http: HttpClient) {}

  // Método para obtener los pagos
  getPagos(): Observable<PagoProducto[]> {
    return this.http.get<PagoProducto[]>(this.pagosProductosUrl); // Devuelve un array de CobroProducto
  }

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addProducto(producto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, producto);
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  searchProductos(nombre?: string, categoria?: string): Observable<any[]> {
    let params: any = {};
    if (nombre) params.nombre = nombre;
    if (categoria) params.categoria = categoria;
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params });
  }

  registrarPago(pago: PagoProducto): Observable<PagoProducto> { 
    return this.http.post<PagoProducto>(`${this.apiUrl}/pagos`, pago); }

}
