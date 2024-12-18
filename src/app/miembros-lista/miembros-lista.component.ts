import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatInputModule } from '@angular/material/input'; 
import { MatSelectModule } from '@angular/material/select'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-miembros-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterModule, MatDialogModule, MatFormFieldModule, FormsModule, MatInputModule, MatSelectModule, FormsModule],
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
    <table mat-table [dataSource]="filteredMiembros" class="mat-elevation-z8">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="apellidos">
          <th mat-header-cell *matHeaderCellDef>Apellidos</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.apellidos }}</td>
        </ng-container>

        <ng-container matColumnDef="fechaAlta">
          <th mat-header-cell *matHeaderCellDef>Fecha Alta</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.fechaAlta }}</td>
        </ng-container>

        <ng-container matColumnDef="fechaBaja">
          <th mat-header-cell *matHeaderCellDef>Fecha Baja</th>
          <td mat-cell *matCellDef="let miembro">{{ miembro.fechaBaja || 'Activo' }}</td>
        </ng-container>

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
  columnas: string[] = ['nombre', 'apellidos', 'fechaAlta', 'fechaBaja', 'acciones'];
  filterValue: string = '';
  statusFilter: string = 'all';
  filteredMiembros: Miembro[] = []; 

  constructor(private miembroService: MiembroService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }
  
  cargarMiembros(): void {
    this.miembroService.getMiembros()
      .subscribe(miembros => {
        this.miembros = miembros;
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
    this.filteredMiembros = filtered;  // Usar filteredMiembros para la tabla
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
        },
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
  
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarMiembros(); 
      }
    });
  }
  
}
