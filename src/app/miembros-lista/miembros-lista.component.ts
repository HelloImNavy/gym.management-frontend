import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MiembroService } from '../services/miembro.service';
import { Miembro } from '../models/miembro.model';
import { MiembrosFormComponent } from '../miembros-form/miembros-form.component';
import { MiembroDetailComponent } from '../miembros/miembros-details.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-miembros-lista',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    FormsModule, 
    MatInputModule, 
    MatSelectModule, 
    FormsModule,
    MatPaginatorModule,
    MatSortModule  
  ],
  template: `
    <h2>SOCIOS</h2>
    <button mat-raised-button 
            style="background-color: #333; color: white; float: right;" 
            (click)="abrirFormularioNuevoMiembro()">
      Nuevo miembro
    </button>

    <div class="filter-container">
      <mat-form-field appearance="fill" class="filter-field">
        <mat-label>Filtrar por Nombre o Apellidos</mat-label>
        <input matInput (keyup)="aplicarFiltros()" [(ngModel)]="filterValue" placeholder="Escriba un nombre o apellido">
      </mat-form-field>

      <mat-form-field appearance="fill" class="filter-field">
        <mat-label>Filtrar por</mat-label>
        <mat-select [(ngModel)]="statusFilter" (selectionChange)="aplicarFiltros()">
          <mat-option value="all">Todos</mat-option>
          <mat-option value="active">Activos</mat-option>
          <mat-option value="inactive">Inactivos</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="container">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
        <!-- Nueva columna de estado -->
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef style="width: 50px;">Estado</th>
          <td mat-cell *matCellDef="let miembro">
            <mat-icon *ngIf="!miembro.fechaBaja" color="primary" style="color: green;">person</mat-icon>
            <mat-icon *ngIf="miembro.fechaBaja" color="warn" style="color: red;">person_off</mat-icon>
          </td>
        </ng-container>

        <!-- Columna de nombre -->
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.nombre }}</td>
        </ng-container>

        <!-- Columna de apellidos -->
        <ng-container matColumnDef="apellidos">
          <th mat-header-cell *matHeaderCellDef>Apellidos</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.apellidos }}</td>
        </ng-container>

        <!-- Columna de teléfono -->
        <ng-container matColumnDef="telefono">
          <th mat-header-cell *matHeaderCellDef>Teléfono</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.telefono }}</td>
        </ng-container>

        <!-- Columna de actividades -->
        <ng-container matColumnDef="actividades">
        <th mat-header-cell *matHeaderCellDef>Actividades</th>
        <td mat-cell *matCellDef="let miembro">{{ "hola" }}</td>
      </ng-container>

        <!-- Columna de observaciones -->
        <ng-container matColumnDef="observaciones">
          <th mat-header-cell *matHeaderCellDef>Observaciones</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.observaciones }}</td>
        </ng-container>

        <!-- Columna de acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let miembro">
            <button mat-icon-button color="primary" (click)="abrirDetallesMiembro(miembro)">
              <mat-icon>info</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="eliminarMiembro(miembro.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
      </table>
      <mat-paginator [length]="totalItems" [pageSize]="pageSize" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    table {
      width: 100%;
      margin-top: 20px;
    }
    button[mat-raised-button] {
      margin-bottom: 20px;
    }
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MiembroListaComponent implements OnInit {
  miembros: Miembro[] = [];
  dataSource = new MatTableDataSource<Miembro>();
  columnas: string[] = ['estado', 'nombre', 'apellidos', 'telefono', 'actividades', 'observaciones', 'acciones'];
  filterValue: string = '';
  statusFilter: string = 'all';
  totalItems: number = 0;
  pageSize: number = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private miembroService: MiembroService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarMiembros(): void {
    this.miembroService.getMiembros()
      .subscribe(miembros => {
        this.miembros = miembros;
        this.dataSource.data = miembros;
        this.totalItems = miembros.length;
        this.aplicarFiltros();
      });
  }

  aplicarFiltros(): void {
    let filtered = this.miembros;
  
    // Filtrar por nombre o apellidos
    if (this.filterValue) {
      filtered = filtered.filter(miembro =>
        miembro.nombre.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        miembro.apellidos.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    }
  
    // Filtrar por estado (activo o inactivo)
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(miembro => !miembro.fechaBaja); // Activos
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(miembro => miembro.fechaBaja); // Inactivos
    }
  
    // Si el filtro es "Todos", no se aplica ningún filtro de estado
    this.dataSource.data = filtered;  // Usar filteredMiembros para la tabla
  }

  eliminarMiembro(id: number | undefined): void {
    if (id && confirm('¿Está seguro de eliminar este miembro?')) {
      this.miembroService.eliminarMiembro(id).subscribe({
        next: (mensaje: string) => {
          alert(mensaje); 
          this.cargarMiembros();
        },
        error: (error) => {
          console.error('Error al eliminar miembro:', error);
        }
      });
    }
  }

  abrirFormularioNuevoMiembro(): void {
    const dialogRef = this.dialog.open(MiembrosFormComponent, { width: '600px', data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMiembros();
      }
    });
  }

  abrirDetallesMiembro(miembro: Miembro): void {
    const dialogRef = this.dialog.open(MiembroDetailComponent, {
      width: '1000px',
      data: miembro, 
    });
  
  }
}
