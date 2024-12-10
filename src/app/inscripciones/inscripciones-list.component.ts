import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MiembroAdaptadorService } from '../adapters/miembro-adaptador.service';
import { Miembro } from '../models/miembro.model';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-inscripciones-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="popup">
      <div class="header">
        <h3>Miembros Inscritos</h3>
        <button class="close-btn" (click)="cerrarPopup()">×</button>
        <input type="text" [(ngModel)]="query" (input)="buscarMiembros(query)" placeholder="Buscar por nombre o apellido">
      </div>

      <ul class="miembros-list">
        <li *ngFor="let miembro of miembros">
          {{ miembro.nombre }} {{ miembro.apellidos }}
        </li>
      </ul>

      <div class="pagination">
        <button (click)="paginar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <span>{{ currentPage + 1 }} / {{ (totalItems / itemsPerPage) | number: '1.0-0' }}</span>
        <button (click)="paginar(currentPage + 1)" [disabled]="(currentPage + 1) * itemsPerPage >= totalItems">Siguiente</button>
      </div>
    </div>
  `,
    styles: [`
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    
    .popup {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 400px;
      margin: 20px auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .header h3 {
      margin: 0;
      font-size: 1.5em;
      color: #333333;
    }
    
    .header input {
      width: 100%;
      padding: 10px;
      font-size: 1em;
      border: 1px solid #cccccc;
      border-radius: 4px;
      outline: none;
      transition: border-color 0.3s;
    }
    
    .header input:focus {
      border-color: #007bff;
    }
    
    .miembros-list {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .miembros-list li {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      color: #555555;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .miembros-list li:last-child {
      border-bottom: none;
    }
    
    .miembros-list li:hover {
      background-color: #f0f8ff;
    }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pagination button {
      background-color: #007bff;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 0.9em;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .pagination button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .pagination button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .pagination span {
      font-size: 0.9em;
      color: #555555;
    }
    .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #f44336; 
}
    `]
})
export class InscripcionesListComponent implements OnInit {
    actividadId: number = 0;
    miembros: Miembro[] = [];
    totalItems: number = 0;
    currentPage: number = 0;
    query: string = '';
    itemsPerPage: number = 25;

    constructor(
        private dialogRef: MatDialogRef<InscripcionesListComponent>,
        private http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: { actividadId: number },
        private adaptadorService: MiembroAdaptadorService
    ) {
        this.actividadId = data.actividadId;
    }

    ngOnInit(): void {
        this.cargarMiembros();
    }

    cargarMiembros(page: number = 0): void {
        if (!this.actividadId) {
            console.error('Error: actividadId no está definido.');
            return;
        }

        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', this.itemsPerPage.toString())
            .set('query', this.query);

        this.http.get<any>(`http://localhost:8080/miembros/actividad/${this.actividadId}`, { params })
            .pipe(
                tap(response => {
                    // Usamos el servicio adaptador para transformar los datos
                    this.miembros = this.adaptadorService.adaptarMiembros(response);
                    this.totalItems = response.totalElements;
                }),
                catchError(error => {
                    console.error('Error al cargar los miembros:', error);
                    return of([]); // Retorna un array vacío en caso de error
                })
            )
            .subscribe();
    }

    buscarMiembros(query: string): void {
        this.query = query;
        this.cargarMiembros();
    }

    paginar(page: number): void {
        this.currentPage = page;
        this.cargarMiembros(page);
    }


    cerrarPopup(): void {
        this.dialogRef.close();
      }
}
