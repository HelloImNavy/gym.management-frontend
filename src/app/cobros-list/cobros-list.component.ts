import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CobrosFormComponent } from '../cobros-form/cobros-form.component';
import { CobrosService } from '../services/cobros.service';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@Component({
  selector: 'app-cobros-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatAutocompleteModule,
  ],
  template: `
    <div class="toolbar">
      <h2>LISTADO MOVIMIENTOS</h2>
      <button mat-raised-button color="primary" (click)="abrirFormularioNuevoCobro()">Nuevo Cobro</button>
    </div>

    <div class="filters">
    <mat-form-field appearance="outline" style="flex: 1; margin-right: 10px;">
  <mat-label>Buscar Socio</mat-label>
  <input matInput [(ngModel)]="filtroNombre" (input)="buscarSocios()" placeholder="Nombre del socio" [matAutocomplete]="auto" />
  <mat-autocomplete #auto="matAutocomplete">
    <mat-option *ngFor="let socio of sociosFiltrados" [value]="socio.nombre">{{ socio.nombre }} {{ socio.apellidos }}</mat-option>
  </mat-autocomplete>
</mat-form-field>
      <mat-form-field appearance="outline" style="flex: 1; margin-right: 10px;">
        <mat-label>Intervalo de Fechas</mat-label>
        <input matInput type="date" [(ngModel)]="fechaInicio" />
        <input matInput type="date" [(ngModel)]="fechaFin" />
      </mat-form-field>
      <button mat-raised-button color="accent" (click)="filtrarCobros()">Filtrar</button>
      <button mat-raised-button color="warn" (click)="limpiarFiltros()">Limpiar</button>
    </div>

    <table mat-table [dataSource]="cobros" class="mat-elevation-z8">
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let cobro">{{ cobro.fecha }}</td>
      </ng-container>

      <ng-container matColumnDef="socio">
        <th mat-header-cell *matHeaderCellDef>Nombre Socio</th>
        <td mat-cell *matCellDef="let cobro">{{ cobro.socioNombre }}</td>
      </ng-container>

      <ng-container matColumnDef="concepto">
        <th mat-header-cell *matHeaderCellDef>Concepto</th>
        <td mat-cell *matCellDef="let cobro">{{ cobro.concepto }}</td>
      </ng-container>

      <ng-container matColumnDef="cantidad">
        <th mat-header-cell *matHeaderCellDef>Cantidad</th>
        <td mat-cell *matCellDef="let cobro">{{ cobro.cantidad | currency }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .filters {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `],
})
export class CobrosListComponent implements OnInit {
  cobros: any[] = [];
  sociosFiltrados: any[] = [];  // Aquí almacenarás los socios filtrados
  displayedColumns: string[] = ['fecha', 'socio', 'concepto', 'cantidad'];
  filtroNombre: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private dialog: MatDialog, private cobrosService: CobrosService) { }

  ngOnInit(): void {
    this.cargarCobros();
  }

  cargarCobros(): void {
    this.cobrosService.obtenerCobrosPorNombreYFechas('', '', '', '').subscribe({
      next: (data) => (this.cobros = data),
      error: () => console.error('Error al cargar los cobros'),
    });
  }

  filtrarCobros(): void {
    this.cobrosService
      .obtenerCobrosPorNombreYFechas(this.filtroNombre, '', this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => (this.cobros = data),
        error: () => console.error('Error al filtrar los cobros'),
      });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarCobros();
  }

  buscarSocios(): void {
    this.cobrosService.obtenerSociosPorNombre(this.filtroNombre).subscribe(socios => {
      this.sociosFiltrados = socios;  
    });
  }

  abrirFormularioNuevoCobro(): void {
    const dialogRef = this.dialog.open(CobrosFormComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.cargarCobros();
    });
  }
}
