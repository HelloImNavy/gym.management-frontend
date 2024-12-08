import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActividadService } from '../services/actividad.service';
import { Actividad } from '../models/actividad.model';
import { Router } from '@angular/router';
import { ActividadesEditComponent } from '../actividades/actividades-edit.component';

@Component({
  selector: 'app-actividades-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <h2>ACTIVIDADES</h2>
    <button mat-raised-button 
            style="background-color: #333; color: white; float: right;" 
            (click)="nuevaActividad()">Nueva actividad</button>

    <div class="container">
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
          <td mat-cell *matCellDef="let actividad">{{ actividad.cupoUsado }} / {{ actividad.cupoTotal }}</td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let actividad">
            <button mat-icon-button color="primary" (click)="editarActividad(actividad)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="eliminarActividad(actividad.id)">
              <mat-icon>delete</mat-icon>
            </button>
            <button mat-icon-button color="accent" (click)="verInscripciones(actividad.id)">
              <mat-icon>group</mat-icon>
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
    .mat-header-cell {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .mat-cell {
      text-align: center;
    }
    .mat-icon-button {
      margin: 0 5px;
    }
    .mat-elevation-z8 {
      border-radius: 8px;
    }
  `]
})
export class ActividadesListComponent implements OnInit {
  actividades: Actividad[] = [];
  columnas: string[] = ['nombre', 'costo', 'cupo', 'acciones'];

  constructor(
    private actividadService: ActividadService, 
    private router: Router, 
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.actividadService.getActividades().subscribe((data: Actividad[]) => {
      this.actividades = data;
    });
  }

  nuevaActividad() {
    this.router.navigate(['/dashboard/actividades/nueva']);
  }

  editarActividad(actividad: Actividad) {
    const dialogRef = this.dialog.open(ActividadesEditComponent, {
      width: '600px',
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
      this.actividadService.deleteActividad(id).subscribe(() => {
        this.cargarActividades();
      });
    }
  }

  verInscripciones(id: number) {
    this.router.navigate(['/dashboard/actividades', id, 'inscripciones']);
  }
}
