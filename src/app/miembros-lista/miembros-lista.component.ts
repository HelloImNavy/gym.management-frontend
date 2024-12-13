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

@Component({
  selector: 'app-miembros-lista',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterModule, MatDialogModule],
  template: `
    <h2>SOCIOS</h2>
    <button mat-raised-button 
            style="background-color: #333; color: white; float: right;" 
            (click)="abrirFormularioNuevoMiembro()">
      Nuevo miembro
    </button>

    <div class="container">
      <table mat-table [dataSource]="miembros" class="mat-elevation-z8">
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
  `]
})
export class MiembroListaComponent implements OnInit {
  miembros: Miembro[] = [];
  columnas: string[] = ['nombre', 'apellidos', 'fechaAlta', 'fechaBaja', 'acciones'];

  constructor(private miembroService: MiembroService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    this.miembroService.getMiembros()
      .subscribe(miembros => {
        this.miembros = miembros;
      });
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
      width: '600px',
      data: miembro, 
    });
  
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarMiembros(); 
      }
    });
  }
  
}
