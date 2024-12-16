import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../services/cobros.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CobroDTO } from '../models/cobro.model';
import { CobroFormComponent } from './cobros-form.component';
import { EditCobroFormComponent } from './cobro-edit.component'; // Importar el componente de edición
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cobros-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <h2>Listado de Cobros</h2>
    <button mat-raised-button style="background-color: #333; color: white; float: right;" (click)="addCobro()">Nuevo Cobro</button>

    <div class="container">
      <table mat-table [dataSource]="filteredCobros" class="mat-elevation-z8">
        
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef> Fecha </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.fecha | date: 'dd/MM/yyyy' }} </td>
        </ng-container>

        <ng-container matColumnDef="miembro">
          <th mat-header-cell *matHeaderCellDef> Nombre Socio </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.miembroNombre }} {{ cobro.miembroApellidos }} </td>
        </ng-container>

        <ng-container matColumnDef="concepto">
          <th mat-header-cell *matHeaderCellDef> Concepto </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.concepto }} </td>
        </ng-container>

        <ng-container matColumnDef="monto">
          <th mat-header-cell *matHeaderCellDef> Importe (€) </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.monto | currency: 'EUR':'symbol':'1.2-2' }} </td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef> Estado </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.estado }} </td>
        </ng-container>

        <ng-container matColumnDef="fechaPago">
          <th mat-header-cell *matHeaderCellDef> Fecha Pago </th>
          <td mat-cell *matCellDef="let cobro"> {{ cobro.fechaPago ? (cobro.fechaPago | date: 'dd/MM/yyyy') : 'N/A' }} </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let cobro">
            <button mat-icon-button color="primary" (click)="editCobro(cobro)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="confirmDelete(cobro)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      /* max-width: 800px;*/
      margin: 0 auto;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .mat-header-cell {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .mat-cell {
      text-align: center;
    }
    .mat-elevation-z8 {
      border-radius: 8px;
    }
    button[mat-raised-button] {
      margin-bottom: 20px;
    }
    .mat-icon-button {
      margin: 0 5px;
    }
  `]
})
export class CobrosListComponent implements OnInit {
  displayedColumns: string[] = ['fecha', 'miembro', 'concepto', 'monto', 'estado', 'fechaPago', 'acciones'];
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  showPendingOnly: boolean = false;
  cobros: CobroDTO[] = [];
  filteredCobros: CobroDTO[] = [];

  constructor(private cobrosService: CobrosService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCobros();
  }

  loadCobros() {
    this.cobrosService.getCobros()
      .pipe(
        tap((data: CobroDTO[]) => {
          console.log('Datos de cobros obtenidos en el componente:', data);
          this.cobros = data;
          this.filteredCobros = data;
        }),
        catchError((error: any) => {
          console.error('Error al cargar cobros:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  filterCobros() {
    this.filteredCobros = this.cobros.filter(cobro => {
      const matchesSearchTerm = (cobro.miembroNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 cobro.miembroApellidos.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesPendingStatus = !this.showPendingOnly || cobro.estado === 'PENDIENTE';
      const matchesStartDate = !this.startDate || new Date(cobro.fecha) >= new Date(this.startDate);
      const matchesEndDate = !this.endDate || new Date(cobro.fecha) <= new Date(this.endDate);

      return matchesSearchTerm && matchesPendingStatus && matchesStartDate && matchesEndDate;
    });
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

  editCobro(cobro: CobroDTO) {
    const dialogRef = this.dialog.open(EditCobroFormComponent, { // Cambiar aquí al componente EditCobroFormComponent
      width: '400px',
      data: { cobro } // Asegurarse de pasar los datos correctamente
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCobros();
      }
    });
  }

  confirmDelete(cobro: CobroDTO) {
    if (confirm('¿Estás seguro de que deseas eliminar este cobro?')) {
      this.deleteCobro(cobro.id);
    }
  }

  deleteCobro(cobroId: number) {
    this.cobrosService.deleteCobro(cobroId).subscribe(() => {
      this.loadCobros();
    });
  }
}
