import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductoService } from '../services/producto.service';
import { PagoProducto } from '../models/pago-producto.model';
import { PagosProductosComponent } from './pagos-productos.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PagosEditarComponent } from './pagos-editar.component';
import { DateAdapter, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ],
  template: `
<div class="container">
  <div class="header">
    <h2>PAGOS DE PRODUCTOS</h2>
    <button mat-raised-button (click)="openPagoForm()" style="background-color: #333; color: white; float: right;">
      Nuevo Pago
    </button>
  </div>

  
  <div class="filters">
    <mat-form-field appearance="fill" class="filter-field">
      <mat-label>Buscar por nombre</mat-label>
      <input matInput (keyup)="applyFilter($event)" placeholder="Nombre del comprador">
    </mat-form-field>
    <mat-form-field appearance="fill" class="filter-field">
      <mat-label>Estado</mat-label>
      <mat-select [(ngModel)]="estadoFilter" (selectionChange)="applyAdvancedFilters()">
        <mat-option value="">Todos</mat-option>
        <mat-option value="Pagado">Pagado</mat-option>
        <mat-option value="Pendiente">Pendiente</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="fill" class="filter-field">
      <mat-label>Seleccionar rango de fechas</mat-label>
      <mat-date-range-input [rangePicker]="picker">
        <input matStartDate placeholder="Fecha inicio" [(ngModel)]="startDate" (dateChange)="applyAdvancedFilters()">
        <input matEndDate placeholder="Fecha fin" [(ngModel)]="endDate" (dateChange)="applyAdvancedFilters()">
      </mat-date-range-input>
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-date-range-picker #picker></mat-date-range-picker>
    </mat-form-field>
  </div>
  <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
    <!-- Columnas -->
    <ng-container matColumnDef="nombreComprador">
      <th mat-header-cell *matHeaderCellDef> Nombre </th>
      <td mat-cell *matCellDef="let pago"> {{pago.nombreComprador}} </td>
    </ng-container>
    <ng-container matColumnDef="tipoComprador">
      <th mat-header-cell *matHeaderCellDef> Tipo Comprador </th>
      <td mat-cell *matCellDef="let pago"> {{pago.tipoComprador}} </td>
    </ng-container>
    <ng-container matColumnDef="productos">
      <th mat-header-cell *matHeaderCellDef> Productos </th>
      <td mat-cell *matCellDef="let pago"> {{pago.productos}} </td>
    </ng-container>
    <ng-container matColumnDef="importeTotal">
      <th mat-header-cell *matHeaderCellDef> Importe Total (€) </th>
      <td mat-cell *matCellDef="let pago"> {{pago.importeTotal}} </td>
    </ng-container>
    <ng-container matColumnDef="fechaPago">
      <th mat-header-cell *matHeaderCellDef> Fecha Pago </th>
      <td mat-cell *matCellDef="let pago"> {{pago.fechaPago | date: 'dd/MM/yyyy'}} </td>
    </ng-container>
    <ng-container matColumnDef="estado">
      <th mat-header-cell *matHeaderCellDef> Estado </th>
      <td mat-cell *matCellDef="let pago" [ngClass]="{'pagado': pago.estado === 'Pagado', 'pendiente': pago.estado === 'Pendiente'}">
        {{pago.estado}}
      </td>
    </ng-container>
    <ng-container matColumnDef="acciones">
      <th mat-header-cell *matHeaderCellDef> Acciones </th>
      <td mat-cell *matCellDef="let pago">
        <button mat-icon-button color="primary" (click)="openEditPagoForm(pago)">
          <mat-icon>edit</mat-icon>
        </button>
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;" [ngClass]="{'pagado': row.estado === 'Pagado', 'pendiente': row.estado === 'Pendiente'}"></tr>

  </table>
</div>


  `,
  styles: [`
    .container {
      margin: 20px;
      margin: 0 auto;
    }

    .title {
      text-align: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .filters {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .filter-field {
      width: 30%; 
    }

    .filter-group {
      display: flex;
      gap: 15px; 
    }

    .table-container {
      padding: 20px;
    }

    mat-header-cell, mat-cell {
      text-align: center;
    }

    .pagado {
      background-color:rgb(113, 218, 116); 
      color: black;
    }

    .pendiente {
      background-color:rgb(232, 146, 146); 

    }


    .mat-elevation-z8 {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Mantén la sombra ligera */
    }

    .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }


  `]
})
export class PagosListaComponent implements OnInit {
  pagos: PagoProducto[] = [];
  displayedColumns: string[] = ['nombreComprador', 'tipoComprador', 'productos', 'importeTotal', 'fechaPago', 'estado', 'acciones'];
  dataSource: MatTableDataSource<PagoProducto> = new MatTableDataSource<PagoProducto>();
  estadoFilter: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productoService: ProductoService, private dialog: MatDialog, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('es-ES');
  }

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.productoService.getPagos().subscribe((data: PagoProducto[]) => {
      this.pagos = data;
      this.dataSource.data = this.pagos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  applyAdvancedFilters(): void {
    this.dataSource.data = this.pagos.filter(pago => {
      const matchEstado = this.estadoFilter ? pago.estado === this.estadoFilter : true;
      const matchFecha = this.startDate && this.endDate
        ? new Date(pago.fechaPago) >= this.startDate && new Date(pago.fechaPago) <= this.endDate
        : true;
      return matchEstado && matchFecha;
    });
  }

  getRowClass(row: PagoProducto): string {
    return row.estado === 'Pendiente' ? 'pending' : row.estado === 'Pagado' ? 'paid' : '';
  }

  openPagoForm(): void {
    const dialogRef = this.dialog.open(PagosProductosComponent, { width: '900px' });
    dialogRef.afterClosed().subscribe(result => { if (result) this.cargarPagos(); });
  }

  openEditPagoForm(pago: PagoProducto): void {
    const dialogRef = this.dialog.open(PagosEditarComponent, { width: '600px', data: pago });
    dialogRef.afterClosed().subscribe(result => { if (result) this.cargarPagos(); });
  }
}
