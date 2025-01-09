
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MiembroService } from '../services/miembro.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Actividad } from '../models/actividad.model';
import { CobroDTO } from '../models/cobro.model';
import { CobrosService } from '../services/cobros.service';
import { Mes } from '../models/mes.model';
import { DTOCobro } from '../models/cobroDTO.model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

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
        <button mat-raised-button class="btn-reactivar" *ngIf="data.fechaBaja" (click)="reactivarMiembro()">
          Reactivar
        </button>
      </div>
    </div>

    <!-- Columna de actividades y cobros -->
    <div class="form-column">
      <!-- Actividades -->
      <section class="activities-section">
        <h3>ACTIVIDADES</h3>
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
        <button mat-raised-button class="btn-agregar-actividad" (click)="onAgregarActividad()" *ngIf="availableActividades.length > 0">
          Agregar Actividad
        </button>
        <p *ngIf="availableActividades.length === 0">Ya está inscrito en todas las actividades disponibles.</p>
      </section>


      <!-- Selector de Año -->
      <mat-form-field appearance="fill" class="compact-field">
        <mat-label>Seleccionar Año</mat-label>
        <mat-select formControlName="selectedYear" (selectionChange)="onYearChange($event)">
          <mat-option *ngFor="let year of years" [value]="year">
            {{ year }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Mostrar pagos filtrados por el año seleccionado -->
      <h3>PAGOS</h3>
      <section class="payments-section">
          
          <div class="months">
              <div *ngFor="let month of filteredMonths" 
                  class="month" 
                  [ngClass]="{ 
                      'paid': month.estado === 'PAGADO' && month.fechaPago, 
                      'pending': month.estado === 'PENDIENTE', 
                      'no-data': month.estado === 'NODATA' 
                  }">
                  <mat-icon class="month-icon">
                      {{ 
                          month.estado === 'PAGADO' ? 'check_circle' : 
                          (month.estado === 'PENDIENTE' ? 'hourglass_empty' : 'remove_circle_outline') 
                      }}
                  </mat-icon>
                  <div>{{ month.nombre }}</div>
                  <div class="payment-date" *ngIf="month.estado === 'PAGADO' && month.fechaPago">
                      {{ month.fechaPago | date: 'dd/MM/yyyy' }}
                  </div>
              </div>
          </div>
      </section>

      <!-- Botones -->
      <div class="button-group">
        <button mat-raised-button class="btn-editar" type="button" (click)="toggleEdit()">
          {{ isEditing ? 'Cancelar' : 'Editar' }}
        </button>
        <button mat-raised-button class="btn-guardar" type="submit">Guardar</button>
        <button mat-button class="btn-cerrar" type="button" (click)="onClose()">Cerrar</button>
      </div>
    </div>
  </div>
</form>

  `,
  styles: [`
    .form-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 10px;
  padding: 10px;
}

.form-body {
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px;
  width: 100%;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compact-field {
  width: 100%;
  margin-bottom: -20px;
}

.button-group {
  display: margin-left;
  margin-top: 20px;
  width: 100%;
  gap: 5px;
  display: flex;
  justify-content: flex-end; 
}

.payments-section {
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.months {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* Para pantallas grandes */
  gap: 20px; /* Espacio entre los elementos */
  width: 100%;
  margin-top: 10px;
}

.month {
  background-color: #f5f5f5;
  padding: 15px; 
  min-height: 80px; 
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.month-icon {
  font-size: 32px; /* Tamaño del ícono */
  margin-bottom: -15px; /* Espacio entre ícono y texto */
}

.payment-date {
  font-size: 5px;
  margin-top: 1px;
  color: #555;
}

/* Estados */
.completed {
  color: green;
}

.paid {
  color: green; /* Texto blanco para resaltar */
}

.pending {
  color: orange; /* Texto blanco */
}

.no-data {
  color: gray; /* Texto blanco */
}


/* Ajustes para pantallas medianas */
@media (max-width: 1024px) {
  .months {
    grid-template-columns: repeat(3, 1fr); /* 3 columnas */
  }
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 768px) {
  .months {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas */
  }
}

/* Ajustes para pantallas muy pequeñas (móviles) */
@media (max-width: 360px) {
  .months {
    grid-template-columns: repeat(2, 1fr); /* Mantener 2 columnas */
    gap: 10px;
  }

  .month {
    padding: 7px; /* Reducir padding en móviles */
    min-height: 50px;
  }

  .month-icon {
    font-size: 24px; /* Tamaño del ícono más pequeño */
  }
}


/* Estilo para cada mes */
.month {
  background-color: #f5f5f5;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

/* Estilo para los iconos dentro de cada mes */
.month .month-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

/* Ajustar tamaño de iconos */
.month-icon {
  font-size: 12px;
  margin-right: 6px;
}

/* Estilo para el nombre del mes */
.month div {
  font-weight: bold;
  font-size: 0.9em;
  margin-top: 8px;
}

/* Detalles de pago */
.payment-date {
  font-size: 0.9em;
  margin-top: 8px;
  color: #555;
}

/* Estado completado */
.completed {
  color: green;
}

/* Estado pendiente */
.pending {
  color: red;
}

/* Meses sin pago */
.no-payment {
  color: gray;
}

.payment-date {
  margin-top: 5px;
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
  color: red;
}

.activities-section button[mat-icon-button] {
  margin-left: 10px;
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

.btn-reactivar {
  background-color: #ffcccc; /* Rojo clarito */
  color: white;
}

.btn-agregar-actividad {
  background-color: #ffcccc; /* Rojo clarito */
  color: white;
}

.btn-editar {
  background-color: #555555; /* Gris oscuro */
  color: white;
}

.btn-guardar {
  background-color: #800000; /* Granate */
  color: white;
}

.btn-cerrar {
  background-color: transparent;
  color: black;
  margin-right: 5px; /* Espacio de 5px entre los botones */
}


  `]
})
export class MiembroDetailComponent implements OnInit {
  miembroForm: FormGroup;
  isEditing = false;
  isConfirmingBaja = false;
  availableActividades: Actividad[] = [];
  todosPagados: boolean = false;
  years: number[] = [];
  filteredMonths: any[] = [];
  cobros: CobroDTO[] = [];
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
      selectedActividadId: [null],
      selectedYear: [new Date().getFullYear()]
    });
  }

  ngOnInit(): void {
    this.data.months = this.getMonths();
    this.loadMemberDetails();
    this.loadAvailableActividades();
    this.initializeYears();

    // Cargar los pagos para el año seleccionado inicialmente
    const selectedYear = this.miembroForm.get('selectedYear')?.value || new Date().getFullYear();
    this.loadCobros();
  }

  // Inicializar la lista de años disponibles
  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = currentYear - 10; i <= currentYear; i++) { // Los últimos 10 años
      this.years.push(i);
    }
  }

  // Filtrar los pagos según el año seleccionado
  onYearChange(event: any) {
    const selectedYear = event.value;
    this.filterPaymentsByYear(selectedYear);
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

  // Método que obtiene los cobros del servidor
  loadCobros(): void {
    // Llamar al servicio para obtener los cobros del miembro actual
    this.cobrosService.getCobrosPorMiembro(this.data.id).subscribe((cobros: CobroDTO[]) => {
      console.log('Cobros obtenidos:', cobros); // Depuración: Verificar los cobros obtenidos

      // Guardar los cobros en una propiedad del componente
      this.cobros = cobros;

      // Llamar al método que se encarga de filtrar y actualizar los estados de los meses por el año actual
      this.filterPaymentsByYear(new Date().getFullYear());
    });
  }


  // Método que filtra los cobros por año y actualiza el estado de los meses
  filterPaymentsByYear(year: number): void {
    // Obtener la referencia a los meses desde los datos del componente
    const meses: Mes[] = this.data.months;

    // Resetear el estado de todos los meses
    console.log('Resetando el estado de los meses...');
    meses.forEach(mes => {
      mes.estado = 'NODATA'; // Inicialmente, todos los meses están sin datos
      mes.fechaPago = undefined; // Limpiar cualquier fecha de pago previa
      console.log(`Mes ${mes.nombre} - Estado: ${mes.estado}, Fecha de Pago: ${mes.fechaPago}`);
    });

    // Iterar por cada mes y calcular su estado
    meses.forEach(mes => {
      console.log(`Procesando mes: ${mes.nombre}...`);

      // Filtrar los cobros que corresponden al mes y año actual o están pendientes
      const pagosDelMes = this.cobros.filter((cobro: CobroDTO) => {
        const fechaCobro = cobro.fechaPago ? new Date(cobro.fechaPago) : null;
        const fechaCobroOriginal = new Date(cobro.fecha); // Fecha original del cobro
        console.log(`- Procesando cobro: ${JSON.stringify(cobro)} - Fecha de cobro: ${fechaCobro}`);

        // Si el estado es "PENDIENTE" y no tiene fecha de pago, considerarlo solo si es para este mes
        if (cobro.estado === 'PENDIENTE' && !fechaCobro) {
          console.log(`  > Encontrado pago pendiente sin fecha para el mes ${mes.nombre}`);
          return fechaCobroOriginal.getFullYear() === year &&
            fechaCobroOriginal.getMonth() === this.getMonthNumber(mes.nombre); // Verificar año y mes con la fecha original
        }

        // Comprobar fechas solo si el estado no es "PENDIENTE"
        return (
          fechaCobro &&
          fechaCobro.getMonth() === this.getMonthNumber(mes.nombre) &&
          fechaCobro.getFullYear() === year
        );
      });

      console.log(`- Pagos encontrados para el mes ${mes.nombre}:`, pagosDelMes);

      // Determinar el estado del mes basado en los cobros encontrados
      if (pagosDelMes.length === 0) {
        console.log(`  > No se encontraron pagos para el mes ${mes.nombre}. Estado: NODATA`);
        mes.estado = 'NODATA';
        mes.fechaPago = undefined;
      } else {
        const todosPagados = pagosDelMes.every((cobro: { estado: string; }) => cobro.estado === 'PAGADO');
        const algunPendiente = pagosDelMes.some((cobro: { estado: string; }) => cobro.estado === 'PENDIENTE');

        console.log(`  > Todos pagados: ${todosPagados}, Algún pendiente: ${algunPendiente}`);

        if (todosPagados) {
          console.log(`  > Todos los pagos están pagados para el mes ${mes.nombre}`);
          mes.estado = 'PAGADO';
          mes.fechaPago = pagosDelMes[0].fechaPago ? new Date(pagosDelMes[0].fechaPago) : undefined;
        } else if (algunPendiente) {
          console.log(`  > Hay pagos pendientes para el mes ${mes.nombre}`);
          mes.estado = 'PENDIENTE';
          // Si el pago está pendiente y no tiene fecha, asignar una fecha provisional
          if (!mes.fechaPago) {
            console.log(`  > Asignando fecha provisional para el mes ${mes.nombre}`);
            mes.fechaPago = new Date(year, this.getMonthNumber(mes.nombre), 1); // Asignar el primer día del mes
          }
        }
      }

      // Depuración para verificar los resultados
      console.log(
        `Mes: ${mes.nombre}, Estado: ${mes.estado}, Fecha de pago: ${mes.fechaPago || 'undefined'}`
      );
    });

    // Actualizar la lista de meses filtrados
    this.filteredMonths = meses.map(mes => ({
      nombre: mes.nombre,
      estado: mes.estado,
      fechaPago: mes.fechaPago
    }));

    console.log('Meses con estado actualizado:', this.filteredMonths);
  }




  getMonths(): any[] {
    return [
      { nombre: 'Enero', estado: 'NODATA' },
      { nombre: 'Febrero', estado: 'NODATA' },
      { nombre: 'Marzo', estado: 'NODATA' },
      { nombre: 'Abril', estado: 'NODATA' },
      { nombre: 'Mayo', estado: 'NODATA' },
      { nombre: 'Junio', estado: 'NODATA' },
      { nombre: 'Julio', estado: 'NODATA' },
      { nombre: 'Agosto', estado: 'NODATA' },
      { nombre: 'Septiembre', estado: 'NODATA' },
      { nombre: 'Octubre', estado: 'NODATA' },
      { nombre: 'Noviembre', estado: 'NODATA' },
      { nombre: 'Diciembre', estado: 'NODATA' }
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
