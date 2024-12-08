import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActividadService } from '../services/actividad.service';
import { Actividad } from '../models/actividad.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-actividades-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  template: `
    <h2>LISTA DE ACTIVIDADES</h2>
    <button (click)="nuevaActividad()">NUEVA ACTIVIDAD</button>
    <div>
      <input [(ngModel)]="filtroNombre" placeholder="Buscar por nombre">
      <input type="number" [(ngModel)]="filtroCostoMin" placeholder="Costo mínimo">
      <input type="number" [(ngModel)]="filtroCostoMax" placeholder="Costo máximo">
      <button (click)="filtrarActividades()">Filtrar</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Costo</th>
          <th>Cupo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let actividad of actividades">
          <td>{{ actividad.nombre }}</td>
          <td>{{ actividad.costo | currency }}</td>
          <td>{{ actividad.cupoUsado }} / {{ actividad.cupoTotal }}</td>
          <td [ngClass]="{ 'lleno': actividad.cupoUsado >= actividad.cupoTotal, 'casi-lleno': actividad.cupoUsado >= actividad.cupoTotal * 0.8 }">
            {{ actividad.cupoUsado }} / {{ actividad.cupoTotal }}
            <span *ngIf="actividad.cupoUsado >= actividad.cupoTotal" class="alerta">Llena</span>
          </td>
          <td>
            <button (click)="editarActividad(actividad)" mat-icon-button><mat-icon>edit</mat-icon></button>
            <button (click)="eliminarActividad(actividad.id)" mat-icon-button><mat-icon>delete</mat-icon></button>
            <button (click)="verInscripciones(actividad.id)" mat-icon-button><mat-icon>group</mat-icon></button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .lleno {
      color: red;
      font-weight: bold;
    }
    .casi-lleno {
      color: orange;
    }
    .alerta {
      margin-left: 10px;
      color: red;
      font-size: smaller;
    }
  `]
})
export class ActividadesListComponent implements OnInit {
  actividades: Actividad[] = [];
  filtroNombre: string = '';
  filtroCostoMin?: number;
  filtroCostoMax?: number;

  constructor(private actividadService: ActividadService, private router: Router) {}

  ngOnInit(): void {
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.actividadService.getActividades().subscribe((data: Actividad[]) => {
      console.log(data); // Para verificar los datos recibidos
      this.actividades = data;
    });
  }
  

  nuevaActividad() {
    this.router.navigate(['/dashboard/actividades/nueva']);
  }

  editarActividad(actividad: Actividad) {
    this.router.navigate(['/actividades', actividad.id, 'editar']);
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

  filtrarActividades(): void {
    this.actividades = this.actividades.filter(a =>
      (!this.filtroNombre || a.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) &&
      (!this.filtroCostoMin || a.costo >= this.filtroCostoMin) &&
      (!this.filtroCostoMax || a.costo <= this.filtroCostoMax)
    );
  }
}
