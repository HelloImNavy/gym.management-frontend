import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../services/cobros.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Cobro } from '../models/cobro.model';
import { CobroFormComponent } from './cobros-form.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-cobros-list',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Listado de Cobros</h2>
        <button class="add-button" (click)="addCobro()">Nuevo Cobro</button>
      </div>
      <div class="filters">
        <input [(ngModel)]="searchTerm" placeholder="Buscar por nombre" (input)="filterCobros()" />
        <input [(ngModel)]="startDate" type="date" placeholder="Fecha inicio" (change)="filterCobros()" />
        <input [(ngModel)]="endDate" type="date" placeholder="Fecha fin" (change)="filterCobros()" />
        <button class="add-button" (click)="loadCobrosPendientes()">
          {{ showPendientes ? 'Mostrar Todos' : 'Cobros Pendientes' }}
        </button>
      </div>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre Socio</th>
            <th>Concepto</th>
            <th>Importe (€)</th>
            <th>Estado</th>
            <th>Fecha Pago</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let cobro of filteredCobros">
            <td>{{ cobro?.fecha | date: 'dd/MM/yyyy' }}</td>
            <td>{{ cobro?.miembro?.nombre }} {{ cobro?.miembro?.apellidos }}</td>
            <td>{{ cobro?.concepto }}</td>
            <td>{{ cobro?.monto | currency: 'EUR':'symbol':'1.2-2' }}</td>
            <td>{{ cobro?.estado }}</td>
            <td>{{ cobro?.fechaPago ? (cobro?.fechaPago | date: 'dd/MM/yyyy') : 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      h2 {
        color: #333;
      }
      .filters {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      input {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .styled-table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 0.9em;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        min-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        overflow: hidden;
      }
      .styled-table thead tr {
        background-color: rgb(103, 77, 84);
        color: #ffffff;
        text-align: left;
      }
      .styled-table th,
      .styled-table td {
        padding: 12px 15px;
      }
      .styled-table tbody tr {
        border-bottom: 1px solid #dddddd;
      }
      .styled-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
      }
      .styled-table tbody tr:last-of-type {
        border-bottom: 2px solid rgb(103, 77, 84);
      }
      .add-button {
        background-color: rgb(103, 77, 84);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 1em;
      }
      .add-button:hover {
        background-color: rgb(103, 77, 84);
      }
    `
  ]
})
export class CobrosListComponent implements OnInit {
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  showPendientes: boolean = false;
  cobros: Cobro[] = [];
  filteredCobros: Cobro[] = [];

  constructor(private cobrosService: CobrosService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCobros();
  }

  loadCobros() {
    this.cobrosService.getCobros()
      .pipe(
        tap((data: Cobro[]) => {
          this.cobros = data;
          this.applyFilters();
        }),
        catchError((error: any) => {
          console.error('Error al cargar cobros:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  applyFilters() {
    this.filteredCobros = this.cobros.filter(cobro => {
      const matchesSearchTerm = this.searchTerm
        ? cobro.miembro?.nombre.includes(this.searchTerm) || cobro.miembro?.apellidos.includes(this.searchTerm)
        : true;
      const matchesStartDate = this.startDate ? new Date(cobro.fecha) >= new Date(this.startDate) : true;
      const matchesEndDate = this.endDate ? new Date(cobro.fecha) <= new Date(this.endDate) : true;
      const matchesPendientes = this.showPendientes ? cobro.estado === 'Pendiente' : true;

      return matchesSearchTerm && matchesStartDate && matchesEndDate && matchesPendientes;
    });
  }

  filterCobros() {
    this.applyFilters();
  }

  loadCobrosPendientes() {
    this.showPendientes = !this.showPendientes;
    this.applyFilters();
  }

  addCobro() {
    const dialogRef = this.dialog.open(CobroFormComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCobros();
      }
    });
  }
}
