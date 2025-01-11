import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MiembroAdaptadorService } from '../adapters/miembro-adaptador.service';
import { Miembro } from '../models/miembro.model';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-inscripciones-list',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        MatTableModule, 
        MatPaginatorModule, 
        MatInputModule, 
        MatFormFieldModule, 
        MatIconModule, 
        MatButtonModule, 
        ReactiveFormsModule],
    template: `
    <div class="container">
      <div class="header">
        <h2>MIEMBROS INSCRITOS</h2>
        <button mat-raised-button (click)="cerrarPopup()" style="background-color: #333; color: white; float: right;">
          Cerrar
        </button>
      </div>
      <div class="filters">
        <mat-form-field appearance="fill" class="filter-field">
          <mat-label>Buscar por nombre o apellido</mat-label>
          <input matInput (keyup)="buscarMiembros($any($event.target).value)" placeholder="Nombre o apellido">
        </mat-form-field>
      </div>
      <table mat-table [dataSource]="miembros" class="mat-elevation-z8">
        <ng-container matColumnDef="nombreApellido">
          <th mat-header-cell *matHeaderCellDef><strong> Nombre y Apellido</strong> </th>
          <td mat-cell *matCellDef="let miembro"> {{miembro.nombre}} {{miembro.apellidos}} </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [length]="totalItems" [pageSize]="itemsPerPage" (page)="paginar($event.pageIndex)"></mat-paginator>
    </div>
    `,
    styles: [`
    .container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filters {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .filter-field {
      width: 100%;
    }
    
    .mat-elevation-z8 {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    `]
})
export class InscripcionesListComponent implements OnInit {
    actividadId: number = 0;
    miembros: Miembro[] = [];
    totalItems: number = 0;
    currentPage: number = 0;
    query: string = '';
    itemsPerPage: number = 10;
    displayedColumns: string[] = ['nombreApellido'];

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
                    this.miembros = this.adaptadorService.adaptarMiembros(response);
                    this.totalItems = response ? response.totalElements : 0; 
                }),
                catchError(error => {
                    console.error('Error al cargar los miembros:', error);
                    return of([]);
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
