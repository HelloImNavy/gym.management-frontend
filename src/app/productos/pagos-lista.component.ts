import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { MatInputModule } from '@angular/material/input';  // Para <mat-label> y <mat-input>
import { MatPaginatorModule } from '@angular/material/paginator';  // Para <mat-paginator>
import { MatButtonModule } from '@angular/material/button';  // Para los botones como 'mat-raised-button'


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
    MatFormFieldModule
  ],
  template: `
    <h2>Pagos de Productos</h2>
    <mat-card class="new-payment-card">
      <button mat-raised-button color="primary" (click)="openPagoForm()">Nuevo Pago</button>
    </mat-card>

    <!-- Barra de búsqueda -->
    <mat-form-field appearance="fill">
      <mat-label>Buscar Pago</mat-label>
      <input matInput (keyup)="applyFilter($event)" placeholder="Buscar por productos o estado">
    </mat-form-field>

    <!-- Tabla con paginación y ordenación -->
    <mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
      <ng-container matColumnDef="nombreComprador">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre del Comprador </th>
        <td mat-cell *matCellDef="let pago"> {{pago.nombreComprador}} </td>
      </ng-container>

      <ng-container matColumnDef="tipoComprador">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Tipo de Comprador </th>
        <td mat-cell *matCellDef="let pago"> {{pago.tipoComprador}} </td>
      </ng-container>

      <ng-container matColumnDef="productos">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Productos </th>
        <td mat-cell *matCellDef="let pago"> {{pago.productos}} </td>
      </ng-container>

      <ng-container matColumnDef="importeTotal">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Importe Total (€) </th>
        <td mat-cell *matCellDef="let pago"> {{pago.importeTotal}} </td>
      </ng-container>

      <ng-container matColumnDef="fechaPago">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha de Pago </th>
        <td mat-cell *matCellDef="let pago"> {{ pago.fechaPago | date:'dd/MM/yyyy' }} </td>
      </ng-container>

      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
        <td mat-cell *matCellDef="let pago"> {{pago.estado}} </td>
      </ng-container>

      <ng-container matColumnDef="observaciones">
        <th mat-header-cell *matHeaderCellDef mat-sort-header> Observaciones </th>
        <td mat-cell *matCellDef="let pago"> {{pago.observaciones}} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </mat-table>

    <!-- Paginación -->
    <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
  `,
  styles: [`
    .new-payment-card {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-start;
    }

    mat-form-field {
      margin-bottom: 20px;
      width: 100%;
    }

    mat-table {
      margin-top: 20px;
    }

    th.mat-header-cell, td.mat-cell {
      padding: 10px;
      text-align: center;
    }

    mat-paginator {
      margin-top: 20px;
    }
  `],
})
export class PagosListaComponent implements OnInit {
  pagos: PagoProducto[] = [];
  displayedColumns: string[] = ['nombreComprador', 'tipoComprador', 'productos', 'importeTotal', 'fechaPago', 'estado', 'observaciones'];
  dataSource: MatTableDataSource<PagoProducto> = new MatTableDataSource<PagoProducto>();  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;


  constructor(private productoService: ProductoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarPagos();
    console.log(this.pagos);
  }

  cargarPagos(): void {
    this.productoService.getPagos().subscribe((data: PagoProducto[]) => {
      this.pagos = data;
      this.dataSource.data = this.pagos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log('Pagos recibidos:', this.pagos);
    });
  }
  
  

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();  
  }

  openPagoForm(): void {
    const dialogRef = this.dialog.open(PagosProductosComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPagos();
      }
    });
  }
}
