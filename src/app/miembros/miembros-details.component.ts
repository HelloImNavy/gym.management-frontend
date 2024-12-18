import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { MiembroService } from '../services/miembro.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Actividad } from '../models/actividad.model';
import { CobroDTO } from '../models/cobro.model';
import { CobrosService } from '../services/cobros.service';
import { Mes } from '../models/mes.model';

@Component({
  selector: 'app-miembro-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  template: `
<form [formGroup]="miembroForm" (ngSubmit)="onSave()" class="form-container">
  <div class="form-body">
    <!-- Columna de datos -->
    <div class="form-column">
      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="nombre" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Apellidos</mat-label>
        <input matInput formControlName="apellidos" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Dirección</mat-label>
        <input matInput formControlName="direccion" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Fecha de Nacimiento</mat-label>
        <input matInput formControlName="fechaNacimiento" type="date" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="telefono" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Observaciones</mat-label>
        <input matInput formControlName="observaciones" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Fecha de Alta</mat-label>
        <input matInput formControlName="fechaAlta" type="date" />
      </mat-form-field>

      <div class="baja-section">
  <mat-form-field appearance="fill" class="compact-field baja-field">
    <mat-label>Fecha de Baja</mat-label>
    <input matInput formControlName="fechaBaja" type="date" [disabled]="!isConfirmingBaja" />
  </mat-form-field>
  <button mat-raised-button color="warn" *ngIf="!isConfirmingBaja" (click)="toggleConfirmBaja()">
    Dar de Baja
  </button>
  <button mat-raised-button color="primary" *ngIf="isConfirmingBaja" (click)="confirmBaja()">
    Confirmar
  </button>
</div>


    </div>

    <!-- Columna de actividades y cobros -->
    <div class="form-column">
      <!-- Actividades -->
      <section class="activities-section">
        <h3>Actividades</h3>
        <ul>
          <li *ngFor="let actividad of data.actividades">
            <span>{{ actividad.nombre }}</span>
            <button mat-icon-button color="warn" (click)="onDarDeBajaActividad(actividad.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </li>
        </ul>
        <mat-form-field appearance="fill" class="compact-field">
          <mat-label>Agregar Nueva Actividad</mat-label>
          <mat-select [(value)]="selectedActividadId">
            <mat-option *ngFor="let actividad of availableActividades" [value]="actividad.id">
              {{ actividad.nombre }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="onAgregarActividad()">Agregar Actividad</button>
      </section>

      <!-- Pagos -->
      <section class="payments-section">
        <h3>Pagos</h3>
        <div class="months">
        <div *ngFor="let month of data.months" class="month">
  <div class="month-info">
    <mat-icon [ngClass]="{ 'completed': month.completed, 'pending': !month.completed }" class="month-icon">
      {{ month.completed ? 'check_circle' : 'cancel' }}
    </mat-icon>
    <div>{{ month.nombre }}</div>
  </div>
  <div *ngIf="month.fechaPago" class="payment-date">
    Fecha de pago:{{ month.fechaPago | date: 'dd/MM/yyyy' }}
  </div>
</div>

        </div>
      </section>

      <!-- Botones -->
      <div class="button-group">
        <button mat-raised-button color="primary" type="submit">Guardar</button>
        <button mat-button type="button" (click)="onClose()">Cerrar</button>
        <button mat-raised-button color="accent" type="button" (click)="toggleEdit()">
          {{ isEditing ? 'Cancelar' : 'Editar' }}
        </button>
      </div>
    </div>
  </div>
</form>

  `,
  styles: [`
    .title {
      text-align: center;
      color:rgb(14, 15, 14);
      margin-bottom: 10px;
    }

    .form-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding: 10px;
    }

    .form-body {
      display: flex;
      justify-content: 20px;
      width: 100%;
      gap: 70px;
    }

    .form-column {
      flex: 1;
      min-width: 250px;
      max-width: 48%;
    }

    .compact-field {
      width: 100%;
      margin-bottom: 10px;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      width: 100%;
    }

    .activities-section, .payments-section {
      margin-top: 30px;
    }

    .months {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .month {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: calc(50% - 15px);
      text-align: left;
    }

    .month-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .month-icon {
      font-size: 16px;
    }

    .completed {
      color: green;
    }

    .pending {
      color: red;
    }

    .payment-date {
      font-size: 12px;
      color: #888;
    }

    button.mat-raised-button {
      margin-top: 10px;
    }

    .activities-section ul {
      list-style: none;
      padding: 0;
    }

    .activities-section li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activities-section mat-icon {
      cursor: pointer;
    }

    .compact-field {
  width: 100%;
  margin-bottom: 1px; 
}

mat-form-field {
  margin-bottom: 5px; 
  padding: 0; 
}

.baja-section {
  display: flex;
  align-items: center;
}

.baja-field {
  flex: 1;
  margin-right: 8px;
}

  `]
})
export class MiembroDetailComponent implements OnInit {
  miembroForm: FormGroup;
  isEditing = false;
  isConfirmingBaja = false;
  selectedActividadId?: number;
  availableActividades: Actividad[] = [];
  todosPagados: boolean = false;

  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private cobrosService: CobrosService,
    private dialogRef: MatDialogRef<MiembroDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = { actividades: [], months: [] }
  ) {
    this.miembroForm = this.fb.group({
      nombre: [{ value: data?.nombre || '', disabled: true }, Validators.required],
      apellidos: [{ value: data?.apellidos || '', disabled: true }, Validators.required],
      direccion: [{ value: data?.direccion || '', disabled: true }, Validators.required],
      fechaNacimiento: [{ value: data?.fechaNacimiento || '', disabled: true }, Validators.required],
      telefono: [{ value: data?.telefono || '', disabled: true }, Validators.required],
      observaciones: [{ value: data?.observaciones || '', disabled: true }],
      fechaAlta: [{ value: data?.fechaAlta || '', disabled: true }, Validators.required],
      fechaBaja: [{ value: data?.fechaBaja || null, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.data.months = this.getMonths();
    this.loadMemberDetails();
    this.loadAvailableActividades();
  }

  loadMemberDetails(): void {
    this.miembroService.getDetallesMiembro(this.data.id).subscribe((detalles) => {
      this.data.actividades = detalles.actividades || [];
      this.calculatePaymentsStatus();
    });
  }

  loadAvailableActividades(): void {
    this.miembroService.getActividadesDisponibles().subscribe((actividades: Actividad[]) => {
      this.availableActividades = actividades;
    });
  }

  calculatePaymentsStatus(): void {
    const meses: Mes[] = this.data.months;

    this.cobrosService.getCobrosPorMiembro(this.data.id).subscribe((cobros: CobroDTO[]) => {
      console.log('Cobros obtenidos:', cobros); // Debug

      meses.forEach(mes => {
        const pagosDelMes = cobros.filter(cobro => {
          const fechaCobro = new Date(cobro.fecha);
          return (
            fechaCobro.getMonth() === this.getMonthNumber(mes.nombre) &&
            fechaCobro.getFullYear() === new Date().getFullYear()
          );
        });

        if (pagosDelMes.length === 0) {
          mes.completed = false; // Cruz roja
        } else {
          mes.completed = pagosDelMes.every(cobro => cobro.estado === 'PAGADO');
        }

        if (mes.completed) {
          mes.fechaPago = pagosDelMes[0]?.fechaPago ? new Date(pagosDelMes[0].fechaPago) : undefined;
        }
      });

      console.log('Meses con estado actualizado:', meses);
      this.data.months = meses;
    }, error => {
      console.error('Error al obtener cobros:', error);
    });
  }

  getMonths(): Mes[] {
    return [
      { nombre: 'Enero', completed: false },
      { nombre: 'Febrero', completed: false },
      { nombre: 'Marzo', completed: false },
      { nombre: 'Abril', completed: false },
      { nombre: 'Mayo', completed: false },
      { nombre: 'Junio', completed: false },
      { nombre: 'Julio', completed: false },
      { nombre: 'Agosto', completed: false },
      { nombre: 'Septiembre', completed: false },
      { nombre: 'Octubre', completed: false },
      { nombre: 'Noviembre', completed: false },
      { nombre: 'Diciembre', completed: false }
    ];
  }

  getMonthNumber(mes: string): number {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
      'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses.indexOf(mes);
  }

  onSave(): void {
    console.log(this.miembroForm.value); 
    if (this.miembroForm.invalid) {
      return;
    }
  
    const updatedData = { ...this.data, ...this.miembroForm.value };
  
    this.miembroService.actualizarMiembro(this.data.id, updatedData).subscribe({
      next: () => {
        // Actualizar los datos del miembro en la vista sin cerrar el popup
        this.data = updatedData;
        // Deshabilitar todos los campos del formulario
        this.isEditing = false;
        Object.keys(this.miembroForm.controls).forEach(control => {
          const formControl = this.miembroForm.get(control);
          if (formControl) {
            formControl.disable();
          }
        });
        console.log('Miembro actualizado y formulario deshabilitado');
      },
      error: (error) => {
        console.error('Error al actualizar el miembro:', error);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close(true);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      Object.keys(this.miembroForm.controls).forEach(control => {
        const formControl = this.miembroForm.get(control);
        if (formControl) {
          formControl.enable();
        }
      });
      this.miembroForm.get('fechaBaja')?.disable(); // Asegúrate de que fechaBaja esté deshabilitado
    } else {
      Object.keys(this.miembroForm.controls).forEach(control => {
        const formControl = this.miembroForm.get(control);
        if (formControl) {
          formControl.disable();
        }
      });
    }
  }

  toggleConfirmBaja(): void {
    this.isConfirmingBaja = !this.isConfirmingBaja;
    this.miembroForm.get('fechaBaja')?.setValue(this.isConfirmingBaja ? new Date().toISOString().split('T')[0] : null);
    if (this.isConfirmingBaja) {
      this.miembroForm.get('fechaBaja')?.enable();
    } else {
      this.miembroForm.get('fechaBaja')?.disable();
    }
  }
  
  confirmBaja(): void {
    if (this.isConfirmingBaja && this.miembroForm.get('fechaBaja')?.value) {
      const fechaBaja = this.miembroForm.get('fechaBaja')?.value;
      const formattedFechaBaja = new Date(fechaBaja).toISOString().split('T')[0]; 
      
      this.miembroService.darDeBajaMiembro(this.data.id, formattedFechaBaja).subscribe({
        next: () => {
          this.data.fechaBaja = formattedFechaBaja; 
          this.miembroForm.get('fechaBaja')?.disable();
          this.isConfirmingBaja = false;
          console.log('Miembro dado de baja');
        },
        error: (error) => {
          console.error('Error al dar de baja al miembro:', error);
        }
      });
    }
  }
  

  onAgregarActividad(): void {
    if (!this.selectedActividadId) {
      return;
    }
    const actividadSeleccionada = this.availableActividades.find(a => a.id === this.selectedActividadId);
    if (!actividadSeleccionada) return;

    this.miembroService.inscribirEnActividad(this.data.id, this.selectedActividadId).subscribe(() => {
      this.data.actividades.push(actividadSeleccionada);
      this.cobrosService.addCobro({
        id: 0,
        miembroNombre: this.data.nombre,
        miembroApellidos: this.data.apellidos,
        concepto: 'Pago de Actividad: ' + actividadSeleccionada.nombre,
        fecha: new Date().toISOString().split('T')[0],
        monto: actividadSeleccionada.costo,
        estado: 'PENDIENTE'
      }).subscribe(() => {
        this.loadMemberDetails();
      });
    });
  }

  onDarDeBajaActividad(actividadId: number): void {
    this.miembroService.darDeBajaActividad(this.data.id, actividadId).subscribe(() => {
      this.data.actividades = this.data.actividades.filter((a: Actividad) => a.id !== actividadId);
      if (this.data.actividades.length === 0) {
        this.miembroService.actualizarMiembro(this.data.id, { ...this.data, fechaBaja: new Date() }).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    });
  }
}
