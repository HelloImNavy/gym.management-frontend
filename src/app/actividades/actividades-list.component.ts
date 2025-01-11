import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActividadService } from '../services/actividad.service';
import { Actividad } from '../models/actividad.model';
import Swal from 'sweetalert2';
import { ActividadesEditComponent } from '../actividades/actividades-edit.component';
import { InscripcionesListComponent } from '../inscripciones/inscripciones-list.component';
import { ActividadFormComponent } from '../actividades/actividad-form.component';

@Component({
  selector: 'app-actividades-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
  <div class="container">
    <div class="header">
      <h2>ACTIVIDADES</h2>
      <button mat-raised-button 
              style="background-color: #333; color: white; float: right;" 
              (click)="nuevaActividad()">Nueva actividad</button>
    </div>
    
      <table mat-table [dataSource]="actividades" class="mat-elevation-z8">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let actividad">{{ actividad.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="costo">
          <th mat-header-cell *matHeaderCellDef>Precio</th>
          <td mat-cell *matCellDef="let actividad">{{ actividad.costo }}€</td>
        </ng-container>

        <ng-container matColumnDef="cupo">
          <th mat-header-cell *matHeaderCellDef>Plazas</th>
          <td mat-cell *matCellDef="let actividad">{{ actividad.cupoUsado }} / {{ actividad.cupo }}</td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef style="text-align: center" >Acciones</th>
          <td mat-cell *matCellDef="let actividad">
            <div style="display: flex; gap: 10px; margin-left: 50px">
              <button mat-icon-button color="primary" (click)="editarActividad(actividad)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="eliminarActividad(actividad.id)">
                <mat-icon>delete</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="verInscripciones(actividad.id)">
                <mat-icon>group</mat-icon>
              </button>
            </div>
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
      max-width: 1000px;
      margin: 0 auto;
    }

    table {
      width: 100%;
      margin-top: 20px;
      table-layout: fixed; 
    }

    .mat-header-cell, .mat-cell {
      text-align: center; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }

    .mat-header-cell:last-child, .mat-cell:last-child {
      text-align: right; 
    }

    .mat-header-cell {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    .mat-icon-button {
      margin: 0 5px;
    }

    .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  `]
})
export class ActividadesListComponent implements OnInit {
  actividades: Actividad[] = [];
  columnas: string[] = ['nombre', 'costo', 'cupo', 'acciones'];

  constructor(
    private actividadService: ActividadService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.actividadService.getActividades().subscribe((data: Actividad[]) => {
      this.actividades = data;
    });
  }

  nuevaActividad() {
    const dialogRef = this.dialog.open(ActividadFormComponent, {
      width: '90vw',
      height: 'auto',
      maxWidth: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarActividades();
      } else {
        console.log('Actividad no guardada');
      }
    });
  }



  editarActividad(actividad: Actividad) {
    const dialogRef = this.dialog.open(ActividadesEditComponent, {
      width: '90vw',
      height: 'auto',
      maxWidth: '450px',
      data: actividad
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarActividades();
      }
    });
  }

  eliminarActividad(id?: number): void {
    if (id) {
      this.actividadService.deleteActividad(id).subscribe({
        next: () => {
          this.cargarActividades();
        },
        error: (err) => {
          if (err.status === 400 && err.error?.message) {
            Swal.fire({
              position: 'bottom',
              icon: 'error',
              title: 'Error al eliminar',
              text: err.error.message,
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          } else {
            Swal.fire({
              position: 'top-end',
              icon: 'warning',
              title: 'Error al eliminar, hay cobros asociados',
              text: err.error.message,
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          }
        }
      });
    }
  }

  verInscripciones(id: number) {
    const dialogRef = this.dialog.open(InscripcionesListComponent, {
      width: '500px',
      height: '500px',
      data: { actividadId: id }
    });
  }

}
