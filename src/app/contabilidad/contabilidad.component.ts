import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CobrosService } from '../services/cobros.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-contabilidad',
  template: `
    <div class="contabilidad-container">
      <div class="header-row">
        <mat-form-field>
          <mat-label>Año</mat-label>
          <mat-select [(value)]="anioSeleccionado" (selectionChange)="cargarDatos()">
            <mat-option *ngFor="let anio of anosDisponibles" [value]="anio">{{ anio }}</mat-option>
          </mat-select>
        </mat-form-field>

        <table *ngIf="anioSeleccionado" class="tabla-totales">
          <thead>
            <tr>
              <th>Socios</th>
              <th>Productos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ totalAnualIngresos | number:'1.0-2' }}€</td>
              <td>{{ totalAnualPagos | number:'1.0-2' }}€</td>
              <td>{{ totalAnualIngresos + totalAnualPagos | number:'1.0-2' }}€</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="chartOptions.data[0].dataPoints.length > 0">
        <canvasjs-chart [options]="chartOptions" [styles]="{ width: '100%', height: '360px' }"></canvasjs-chart>
      </div>

      <div *ngIf="chartPagosOptions.data[0].dataPoints.length > 0">
        <canvasjs-chart [options]="chartPagosOptions" [styles]="{ width: '100%', height: '360px' }"></canvasjs-chart>
      </div>
    </div>
  `,
  styles: [`
    .contabilidad-container {
      padding: 20px;
    }

  
    .header-row {
      display: flex;
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 20px; 
    }

    mat-form-field {
      width: 200px; 
    }

    
    .tabla-totales {
      width: 60%; 
      margin: 0 auto; 
      border-collapse: collapse; 
      text-align: center; 
      margin-bottom: 20px; 
    }

    .tabla-totales th, .tabla-totales td {
      padding: 8px; 
      border: 1px solid #ddd; 
    }

    .tabla-totales th {
      background-color: #f2f2f2; 
    }

    .tabla-totales td {
      font-weight: bold;
    }

    canvasjs-chart {
      display: block;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    CanvasJSAngularChartsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CurrencyPipe]
})
export class ContabilidadComponent implements OnInit {

  anosDisponibles: number[] = [];
  anioSeleccionado: number = new Date().getFullYear(); 
  chartOptions: any;
  chartPagosOptions: any;
  totalAnualIngresos: number = 0;
  totalAnualPagos: number = 0;

  constructor(
    private cobrosService: CobrosService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {
    this.chartOptions = {
      title: {
        text: "Ingresos Socios",
        fontSize: 20
      },
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
        includeZero: true,
        valueFormatString: "#,##0€"
      },
      data: [{
        type: "line", 
        lineThickness: 2, 
        yValueFormatString: "#,##0€",
        color: "#01b8aa",
        dataPoints: []
      }]
    };

    this.chartPagosOptions = {
      title: {
        text: "Pagos Productos",
        fontSize: 20
      },
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
        includeZero: true,
        valueFormatString: "#,##0€"
      },
      data: [{
        type: "line",
        lineThickness: 2, 
        yValueFormatString: "#,##0€",
        color: "#f39c12",
        dataPoints: []
      }]
    };

  }

  ngOnInit(): void {
    this.cargarAnosDisponibles();
    this.cargarDatos(); 
  }

  cargarAnosDisponibles(): void {
    const añoActual = new Date().getFullYear();
    this.anosDisponibles = Array.from({ length: 6 }, (_, index) => añoActual - index);
  }

  cargarDatos(): void {
    this.cargarIngresos();
    this.cargarPagosProductos();
  }

  cargarIngresos(): void {
    this.chartOptions.data[0].dataPoints = [];
    this.cdr.detectChanges();

    this.cobrosService.getCobrosPagadosAnio(this.anioSeleccionado).subscribe(ingresos => {
      const ingresosPorMes = Array(12).fill(0);
      this.totalAnualIngresos = 0;
      ingresos.forEach(ingreso => {
        const fecha = new Date(ingreso.fecha);
        const mes = fecha.getMonth();
        ingresosPorMes[mes] += ingreso.monto || 0;
        this.totalAnualIngresos += ingreso.monto || 0;
      });

      this.chartOptions.data[0].dataPoints = ingresosPorMes.map((monto, index) => ({
        label: this.getNombreMes(index),
        y: monto
      }));

      this.chartOptions = { ...this.chartOptions };
      this.cdr.detectChanges();
    }, error => {
      console.error("Error al cargar ingresos:", error);
    });
  }

  cargarPagosProductos(): void {
    this.chartPagosOptions.data[0].dataPoints = [];
    this.cdr.detectChanges();

    this.productoService.getPagos().subscribe(pagos => {
      const pagosPorSocios = Array(12).fill(0);
      this.totalAnualPagos = 0;

      const pagosFiltrados = pagos.filter(pago => {
        const fechaPago = new Date(pago.fechaPago);
        return fechaPago.getFullYear() === this.anioSeleccionado;
      });

      pagosFiltrados.forEach(pago => {
        const fecha = new Date(pago.fechaPago);
        const mes = fecha.getMonth();
        pagosPorSocios[mes] += pago.importeTotal || 0;
        this.totalAnualPagos += pago.importeTotal || 0;
      });

      this.chartPagosOptions.data[0].dataPoints = pagosPorSocios.map((monto, index) => ({
        label: this.getNombreMes(index),
        y: monto
      }));

      this.chartPagosOptions = { ...this.chartPagosOptions };
      this.cdr.detectChanges();
    }, error => {
      console.error("Error al cargar pagos de productos:", error);
    });
  }

  getNombreMes(index: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[index];
  }
}
