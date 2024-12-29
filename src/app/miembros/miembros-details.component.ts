import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { Inscripcion } from '../models/inscripcion.model';
import { DTOCobro } from '../models/cobroDTO.model';

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
    MatIconModule,
    FormsModule
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

      <!-- Columna de baja -->
      <div class="baja-section">
        <mat-form-field appearance="fill" class="compact-field baja-field">
          <mat-label>Fecha de Baja</mat-label>
          <input matInput formControlName="fechaBaja" type="date" [disabled]="!isConfirmingBaja" />
        </mat-form-field>
        <button mat-raised-button color="warn" *ngIf="!isConfirmingBaja && !data.fechaBaja" (click)="toggleConfirmBaja()">
          Dar de Baja
        </button>
        <button mat-raised-button color="primary" *ngIf="isConfirmingBaja && !data.fechaBaja" (click)="confirmBaja()">
          Confirmar Baja
        </button>
        <button mat-raised-button color="accent" *ngIf="data.fechaBaja" (click)="reactivarMiembro()">
          Reactivar
        </button> 
      </div>
    </div>

    <!-- Columna de actividades y cobros -->
    <div class="form-column">
      <!-- Actividades -->
      <section class="activities-section">
        <h3>Actividades</h3>
        <ul>
          <li *ngFor="let inscripcion of data.inscripciones">
            <span *ngIf="!inscripcion.fechaBaja">
              {{ inscripcion.fechaBaja | date: 'dd/MM/yyyy' }} {{ inscripcion.actividad?.nombre }}
            </span>
            <button *ngIf="!inscripcion.fechaBaja" 
                    mat-icon-button 
                    color="warn" 
                    matTooltip="Dar de baja de esta actividad" 
                    (click)="confirmDarDeBajaActividad(inscripcion.id)">
              <mat-icon>close</mat-icon>
            </button>
          </li>
        </ul>

        <mat-form-field *ngIf="availableActividades.length > 0" appearance="fill" class="compact-field">
          <mat-label>Agregar Nueva Actividad</mat-label>
          <mat-select formControlName="selectedActividadId" placeholder="Selecciona una actividad" *ngIf="availableActividades.length > 0">
            <mat-option *ngFor="let actividad of availableActividades" [value]="actividad.id">
              {{ actividad.nombre }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="onAgregarActividad()" *ngIf="availableActividades.length > 0">
          Agregar Actividad
        </button>
        <p *ngIf="availableActividades.length === 0">Ya está inscrito en todas las actividades disponibles.</p>
      </section>


      <!-- Pagos -->
      <section class="payments-section">
        <h3>Pagos</h3>
        <div class="months">
          <div *ngFor="let month of data.months" class="month" 
              [ngClass]="{ 'completed': month.completed, 'pending': !month.completed && month.fechaPago, 'no-payment': !month.fechaPago && !month.completed }">
            <div class="month-info">
              <mat-icon class="month-icon">
                {{ month.completed ? 'check_circle' : (!month.fechaPago ? 'remove_circle_outline' : 'cancel') }}
              </mat-icon>
              <div>{{ month.nombre }}</div>
            </div>
            <div *ngIf="month.fechaPago" class="payment-date">
              Fecha de pago: {{ month.fechaPago | date: 'dd/MM/yyyy' }}
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

    .payments-section {
      margin-top: 30px;
    }

    .activities-section ul {
  list-style: none;
  padding: 0;
}

.activities-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activities-section mat-icon {
  cursor: pointer;
  color: red; 
}

.activities-section button[mat-icon-button] {
  margin-left: 10px;
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

/* Nueva clase para meses sin pagos */
.no-payment {
  color: gray;
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
  availableActividades: Actividad[] = [];
  todosPagados: boolean = false;
  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private cobrosService: CobrosService,
    private dialogRef: MatDialogRef<MiembroDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = { months: [] }
  ) {
    this.miembroForm = this.fb.group({
      nombre: [{ value: data?.nombre || '', disabled: true }, Validators.required],
      apellidos: [{ value: data?.apellidos || '', disabled: true }, Validators.required],
      direccion: [{ value: data?.direccion || '', disabled: true }, Validators.required],
      fechaNacimiento: [{ value: data?.fechaNacimiento || '', disabled: true }, Validators.required],
      telefono: [{ value: data?.telefono || '', disabled: true }, Validators.required],
      observaciones: [{ value: data?.observaciones || '', disabled: true }],
      fechaAlta: [{ value: data?.fechaAlta || '', disabled: true }, Validators.required],
      fechaBaja: [{ value: data?.fechaBaja || null, disabled: true }],
      selectedActividadId: [null]
    });
  }

  ngOnInit(): void {
    this.data.months = this.getMonths();
    this.loadMemberDetails();
    this.loadAvailableActividades();
  }

  loadMemberDetails(): void {
    this.miembroService.getInscripcionesByMiembroId(this.data.id).subscribe((detalles: any) => {
      console.log("Detalles del miembro recibidos:", detalles);
      this.data.inscripciones = detalles || [];
      console.log("Inscripciones recibidas:", this.data.inscripciones);

      this.data.inscripciones.forEach((inscripcion: any) => {
        console.log(`Inscripción ID: ${inscripcion.id}, Actividad ID: ${inscripcion.idActividad}`);
      });

      // Vincular inscripciones con actividades correspondientes
      this.data.inscripciones = this.data.inscripciones.map((inscripcion: any) => {
        const actividad = this.data.actividades.find((a: Actividad) => a.id === inscripcion.idActividad);
        if (actividad) {
          console.log(`Vinculando actividad ${actividad.nombre} (ID: ${actividad.id}) con inscripción ${inscripcion.idActividad}`);
          return { ...inscripcion, actividad }; // Crear un nuevo objeto que incluye la actividad
        } else {
          console.warn(`No se encontró actividad para la inscripción ${inscripcion.id} con actividadId ${inscripcion.idActividad}`);
          return { ...inscripcion, actividad: null }; // Manejar la inscripción sin actividad
        }
      });

      console.log("Inscripciones después de vincular actividades:", this.data.inscripciones);
      this.calculatePaymentsStatus();
      this.loadAvailableActividades();
    }, error => {
      console.error("Error al cargar los detalles del miembro:", error);
    });
  }

  loadAvailableActividades(): void {
    this.miembroService.getActividadesDisponibles().subscribe((actividades: Actividad[]) => {
      // Filtrar actividades ya inscritas
      this.availableActividades = actividades.filter(actividad =>
        !this.data.inscripciones.some((inscripcion: { actividad: { id: number; }; fechaBaja: any; }) =>
          inscripcion.actividad?.id === actividad.id && !inscripcion.fechaBaja
        )
      );
      this.checkActividadesDisponibles();
    });
  }



  checkActividadesDisponibles(): void {
    const hasActividadesDisponibles = this.availableActividades.length > 0;
    const actividadControl = this.miembroForm.get('selectedActividadId');

    if (actividadControl) {
      if (hasActividadesDisponibles) {
        actividadControl.enable();
      } else {
        actividadControl.disable();
      }
    }
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

  onClose(): void {
    this.dialogRef.close(true);
  }

  onSave(): void {
    if (this.miembroForm.invalid) {
      return;
    }

    const updatedData = { ...this.data, ...this.miembroForm.value };
    this.miembroService.actualizarMiembro(this.data.id, updatedData).subscribe({
      next: () => {
        this.data = updatedData;
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

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      Object.keys(this.miembroForm.controls).forEach(control => {
        const formControl = this.miembroForm.get(control);
        if (formControl) {
          formControl.enable();
        }
      });
      this.miembroForm.get('fechaBaja')?.disable();
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

  reactivarMiembro(): void {
    if (this.data && this.miembroForm.get('fechaBaja')?.value) {
      // Crear objeto con los datos actualizados para reactivar el miembro
      const updatedData = { ...this.data, fechaBaja: null };

      // Llamar al servicio para actualizar al miembro
      this.miembroService.actualizarMiembro(this.data.id, updatedData).subscribe({
        next: () => {
          // Limpiar la fecha de baja en el objeto data
          this.data.fechaBaja = null;
          this.miembroForm.get('fechaBaja')?.setValue(null);

          console.log('Miembro reactivado');

          // Recargar los detalles del miembro
          this.loadMemberDetails();  // Esto debería recargar las inscripciones y cualquier otra información

          // Si necesitas también habilitar algunos campos específicos después de la reactivación, puedes hacerlo aquí:
          this.toggleEdit();  // Activar la edición si es necesario
        },
        error: (error) => {
          console.error('Error al reactivar al miembro:', error);
        }
      });
    } else {
      console.log('El miembro no está dado de baja.');
    }
  }

  confirmBaja(): void {
    if (this.isConfirmingBaja && this.miembroForm.get('fechaBaja')?.value) {
      const fechaBaja = this.miembroForm.get('fechaBaja')?.value;
      const formattedFechaBaja = new Date(fechaBaja).toISOString().split('T')[0];

      this.miembroService.darDeBajaMiembro(this.data.id, formattedFechaBaja).subscribe({
        next: () => {
          // Actualizar los detalles del miembro
          this.data.fechaBaja = formattedFechaBaja;
          this.miembroForm.get('fechaBaja')?.disable();
          this.isConfirmingBaja = false;

          // Forzar la actualización de la vista para que los botones se actualicen
          this.loadMemberDetails();
          console.log('Miembro dado de baja');
        },
        error: (error) => {
          console.error('Error al dar de baja al miembro:', error);
        }
      });
    }
  }


  onAgregarActividad(): void {
    const selectedActividadId = this.miembroForm.get('selectedActividadId')?.value;
    if (!selectedActividadId) {
      return;
    }

    const actividadSeleccionada = this.availableActividades.find(a => a.id === selectedActividadId);
    if (!actividadSeleccionada) return;

    // Inscribir al miembro en la actividad
    this.miembroService.inscribirEnActividad(parseInt(this.data.id), parseInt(selectedActividadId)).subscribe({
      next: (response) => {
        const inscripcion = response.inscripcion;
        if (!inscripcion?.id) {
          console.error("La inscripción no contiene un ID válido.");
          return;
        }

        // Agregar la inscripción a la lista
        this.data.inscripciones.push({
          id: inscripcion.id,
          actividad: actividadSeleccionada,
          fechaBaja: null
        });

        // Crear el cobro con el objeto miembro completo (en lugar de solo los datos de nombre y apellidos)
        const cobroPayload: DTOCobro = {
          miembro: {
            id: parseInt(this.data.id),
            nombre: this.data.nombre,
            apellidos: this.data.apellidos,
          },
          inscripcion: {
            id: inscripcion.id, // Usamos el ID de la inscripción recién creada
            actividad: {
              id: actividadSeleccionada.id,
              nombre: actividadSeleccionada.nombre,
            },
          },
          concepto: 'Pago de Actividad: ' + actividadSeleccionada.nombre,
          fecha: new Date().toISOString().split('T')[0],
          monto: actividadSeleccionada.costo,
          estado: 'PENDIENTE',
        };
        console.log("Cobro Payload:", cobroPayload);

        // Enviar el cobro
        this.cobrosService.addCobroMiembro(cobroPayload).subscribe({
          next: () => {
            this.loadMemberDetails();
            this.loadAvailableActividades();  // Recargar los detalles del miembro después del cobro
          },
          error: (error) => {
            console.error('Error al añadir el cobro:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al inscribir al miembro en la actividad:', error);
      }
    });
  }


  confirmDarDeBajaActividad(actividadId: number): void {
    if (confirm("¿Confirma que desea dar de baja al miembro de esta actividad?")) {
      this.onDarDeBajaActividad(actividadId);
    }
  }

  onDarDeBajaActividad(inscripcionId: number): void {
    this.miembroService.darDeBajaInscripcion(inscripcionId, new Date().toISOString().split('T')[0]).subscribe({
      next: () => {
        // Actualizar inscripciones
        const inscripcion = this.data.inscripciones.find((i: { id: number; }) => i.id === inscripcionId);
        if (inscripcion) {
          inscripcion.fechaBaja = new Date(); // Marcar como dada de baja
        }

        // Recalcular actividades disponibles
        this.loadAvailableActividades();
      },
      error: (error) => {
        console.error("Error al dar de baja la actividad:", error);
      }
    });
  }
}  
