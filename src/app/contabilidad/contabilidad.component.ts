import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContabilidadService } from '../services/contabilidad.service';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-contabilidad',
  template: `
    <div class="contabilidad-container">
      <h2>Contabilidad</h2>

      <!-- Selección de año -->
      <mat-form-field>
        <mat-label>Año</mat-label>
        <mat-select [(value)]="anioSeleccionado" (selectionChange)="cargarIngresos()">
          <mat-option *ngFor="let anio of anosDisponibles" [value]="anio">{{ anio }}</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Selección de mes -->
      <mat-form-field>
        <mat-label>Mes</mat-label>
        <mat-select [(value)]="mesSeleccionado" (selectionChange)="cargarIngresos()">
          <mat-option *ngFor="let mes of meses; let i = index" [value]="i + 1">{{ mes }}</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Mostrar los ingresos del mes -->
      <div *ngIf="ingresos.length > 0">
        <h3>Ingresos en {{ meses[mesSeleccionado - 1] }} {{ anioSeleccionado }}:</h3>
        <table mat-table [dataSource]="ingresos">
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let ingreso">{{ ingreso.fecha }}</td>
          </ng-container>
          
          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let ingreso">{{ ingreso.monto | currency }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['fecha', 'monto']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['fecha', 'monto'];"></tr>
        </table>

        <h3>Total en el mes: {{ totalMes | currency }}</h3>
      </div>

      <!-- Mostrar el total del año -->
      <div *ngIf="anioSeleccionado">
        <h3>Total ganado en el año {{ anioSeleccionado }}: {{ totalAno | currency }}</h3>
      </div>

      <!-- Gráfico de barras -->
      <div *ngIf="barChartData.datasets[0].data.length > 0">
        <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
        </canvas>
      </div>
    </div>
  `,
  styles: [` 
    .contabilidad-container {
      padding: 20px;
    }

    table {
      width: 100%;
      margin-top: 20px;
    }

    button {
      margin-top: 20px;
    }

    mat-form-field {
      width: 200px;
      margin-right: 10px;
    }

    h3 {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [CurrencyPipe]
})
export class ContabilidadComponent implements OnInit {

  anosDisponibles: number[] = [];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number = new Date().getMonth() + 1; // Enero es 0 en JavaScript
  ingresos: any[] = [];
  totalAno: number = 0;
  totalMes: number = 0;
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Ingresos Mensuales' }
    ]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
  };

  constructor(private contabilidadService: ContabilidadService, private currencyPipe: CurrencyPipe, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarAnosDisponibles();
    this.cargarIngresos();
  }

  cargarAnosDisponibles(): void {
    this.anosDisponibles = [2024, 2023, 2022]; // Cambiar según sea necesario
  }

  cargarIngresos(): void {
    console.log("Cargando ingresos para el año:", this.anioSeleccionado, "y mes:", this.mesSeleccionado);

    // Llamamos al servicio para obtener los cobros filtrados por mes y año
    this.contabilidadService.getCobrosPagadosAnio(this.anioSeleccionado)  // Método actualizado para obtener los ingresos por año
      .subscribe(ingresos => {
        console.log("Ingresos recibidos:", ingresos);

        // Filtrar los ingresos para el mes y año seleccionado
        this.ingresos = ingresos.filter(ingreso => {
          const fecha = new Date(ingreso.fecha);
          return fecha.getFullYear() === this.anioSeleccionado && fecha.getMonth() + 1 === this.mesSeleccionado;
        });

        // Recalcular el total del mes
        this.totalMes = this.ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        this.totalAno = this.ingresos.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        this.actualizarChart();
        this.cdr.detectChanges();  // Forzar actualización de vista
      }, error => {
        console.log("Error al cargar ingresos:", error);
      });
  }

  actualizarChart() {
    const ingresosMensuales = new Array(12).fill(0);

    this.ingresos.forEach(ingreso => {
      const mes = new Date(ingreso.fecha).getMonth();
      ingresosMensuales[mes] += ingreso.monto || 0;
    });

    this.barChartData.labels = this.meses;
    this.barChartData.datasets[0].data = ingresosMensuales;
  }
}
