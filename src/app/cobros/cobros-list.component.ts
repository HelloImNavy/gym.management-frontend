import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../services/cobros.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CobroDTO } from '../models/cobro.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { EditCobroFormComponent } from './cobro-edit.component';

@Component({
  selector: 'app-cobros-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  template: `
    <h2>Listado de Cobros</h2>

    <div class="filter-container">
      <!-- Filtro por fecha de inicio -->
      <mat-form-field>
        <input matInput [matDatepicker]="startDatepicker" placeholder="Fecha Inicio" [(ngModel)]="startDate" (dateChange)="applyFilter()"/>
        <mat-datepicker-toggle matSuffix [for]="startDatepicker"></mat-datepicker-toggle>
        <mat-datepicker #startDatepicker></mat-datepicker>
      </mat-form-field>

      <!-- Filtro por fecha de fin -->
      <mat-form-field>
        <input matInput [matDatepicker]="endDatepicker" placeholder="Fecha Fin" [(ngModel)]="endDate" (dateChange)="applyFilter()"/>
        <mat-datepicker-toggle matSuffix [for]="endDatepicker"></mat-datepicker-toggle>
        <mat-datepicker #endDatepicker></mat-datepicker>
      </mat-form-field>

      <!-- Selector de estado -->
      <mat-form-field>
        <mat-select placeholder="Estado" [(ngModel)]="selectedState" (selectionChange)="applyFilter()">
          <mat-option value="TODOS">Todos</mat-option>
          <mat-option value="PENDIENTE">Pendientes</mat-option>
          <mat-option value="PAGADO">Pagados</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Filtro por nombre -->
      <mat-form-field>
        <input matInput placeholder="Buscar por nombre" [(ngModel)]="searchTerm" (input)="applyFilter()">
      </mat-form-field>

      <!-- Botón para resetear los filtros -->
      <button mat-raised-button color="accent" (click)="resetFilters()">Resetear Filtros</button>
    </div>

    <div class="container">
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
          <td mat-cell *matCellDef="let cobro" [ngClass]="{'pendiente': cobro.estado === 'PENDIENTE', 'pagado': cobro.estado === 'PAGADO'}">
            {{ cobro.fecha | date: 'dd/MM/yyyy' }} 
          </td>
        </ng-container>

        <ng-container matColumnDef="miembro">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre Socio </th>
          <td mat-cell *matCellDef="let cobro">{{ cobro.miembroNombre }} {{ cobro.miembroApellidos }} </td>
        </ng-container>

        <ng-container matColumnDef="concepto">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Concepto </th>
          <td mat-cell *matCellDef="let cobro">{{ cobro.concepto }} </td>
        </ng-container>

        <ng-container matColumnDef="monto">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Importe (€) </th>
          <td mat-cell *matCellDef="let cobro">{{ cobro.monto | currency: 'EUR':'symbol':'1.2-2' }} </td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
          <td mat-cell *matCellDef="let cobro">
            <span [ngClass]="{'pendiente-text': cobro.estado === 'PENDIENTE', 'pagado-text': cobro.estado === 'PAGADO'}">
              {{ cobro.estado }} 
            </span>
            <mat-icon *ngIf="cobro.estado === 'PENDIENTE'" color="warn">remove_circle</mat-icon>
            <mat-icon *ngIf="cobro.estado === 'PAGADO'" color="primary">check_circle</mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let cobro">
            <button mat-icon-button color="primary" (click)="editCobro(cobro)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="confirmDelete(cobro)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [`  
    .filter-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .container {
      padding: 20px;
      margin: 0 auto;
    }
    table {
      width: 100%;
      table-layout: fixed;
    }
    .mat-header-cell {
      background-color: #f5f5f5;
      font-weight: bold;
      width: 150px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .mat-cell {
      text-align: center;
      padding: 8px;
      width: 150px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .mat-elevation-z8 {
      border-radius: 8px;
    }
    button[mat-raised-button] {
      margin-bottom: 20px;
    }
    .mat-icon-button {
      margin: 0 5px;
    }

    .pendiente {
      background-color: #ffcccc;
    }

    .pagado {
      background-color: #ccffcc;
    }

    .pendiente-text {
      color: red;
    }

    .pagado-text {
      color: green;
    }
  `]
})
export class CobrosListComponent implements OnInit {
  displayedColumns: string[] = ['fecha', 'miembro', 'concepto', 'monto', 'estado', 'acciones'];
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedState: string = 'TODOS';
  searchTerm: string = '';
  cobros: CobroDTO[] = [];
  dataSource: MatTableDataSource<CobroDTO> = new MatTableDataSource<CobroDTO>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private cobrosService: CobrosService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadCobros();
  }

  loadCobros() {
    this.cobrosService.getCobros()
      .pipe(
        tap((data: CobroDTO[]) => {
          console.log('Datos de cobros obtenidos:', data);
          this.cobros = data;
          this.dataSource.data = data;
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }),
        catchError((error: any) => {
          console.error('Error al cargar cobros:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  applyFilter() {
    let filteredData = this.cobros;

    // Filtrar por rango de fechas
    if (this.startDate) {
      filteredData = filteredData.filter(cobro => new Date(cobro.fecha) >= this.startDate!);
    }
    if (this.endDate) {
      filteredData = filteredData.filter(cobro => new Date(cobro.fecha) <= this.endDate!);
    }

    // Filtrar por estado
    if (this.selectedState !== 'TODOS') {
      filteredData = filteredData.filter(cobro => cobro.estado === this.selectedState);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      filteredData = filteredData.filter(cobro => {
        return cobro.miembroNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          cobro.miembroApellidos.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }

    this.dataSource.data = filteredData; // Actualizar la tabla con los datos filtrados
  }

  resetFilters() {
    // Resetear los filtros
    this.startDate = null;
    this.endDate = null;
    this.selectedState = 'TODOS';
    this.searchTerm = '';
    this.applyFilter(); // Aplicar los filtros resetados
  }

  editCobro(cobro: CobroDTO) {
    const dialogRef = this.dialog.open(EditCobroFormComponent, {
      width: '400px',
      data: { cobro }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCobros();
      }
    });
  }

  confirmDelete(cobro: CobroDTO) {
    if (confirm('¿Estás seguro de que deseas eliminar este cobro?')) {
      this.deleteCobro(cobro.id!);
    }
  }

  deleteCobro(cobroId: number) {
    this.cobrosService.deleteCobro(cobroId).subscribe(() => {
      this.loadCobros();
    });
  }
}
