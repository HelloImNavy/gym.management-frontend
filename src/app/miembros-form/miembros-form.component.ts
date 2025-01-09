import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MiembroService } from '../services/miembro.service';
import { Miembro } from '../models/miembro.model';
import { ActividadService } from '../services/actividad.service';
import { Actividad } from '../models/actividad.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-miembros-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  template: `
<div class="form-container">
  <h2>NUEVO SOCIO</h2>
  <form [formGroup]="miembroForm" (ngSubmit)="onSubmit()">
    <div class="form-row">
      <mat-form-field appearance="fill">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="nombre" required />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Apellidos</mat-label>
        <input matInput formControlName="apellidos" />
      </mat-form-field>
    </div>

    <div class="form-row">
      <mat-form-field appearance="fill">
        <mat-label>Dirección</mat-label>
        <input matInput formControlName="direccion" />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Nacimiento</mat-label>
        <input matInput formControlName="fechaNacimiento" type="date" required />
      </mat-form-field>
    </div>

    <div class="form-row">
      <mat-form-field appearance="fill">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="telefono" />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Alta</mat-label>
        <input matInput formControlName="fechaAlta" type="date" />
      </mat-form-field>
    </div>

    <div class="form-row">
      <mat-form-field appearance="fill">
        <mat-label>Actividades</mat-label>
        <mat-select formControlName="actividades" multiple>
          <mat-option *ngFor="let actividad of actividades" [value]="actividad.id">
            {{ actividad.nombre }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Observaciones</mat-label>
        <textarea matInput formControlName="observaciones"></textarea>
      </mat-form-field>
    </div>

    <div class="form-actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="!miembroForm.valid">
        Guardar
      </button>
      <button mat-button color="warn" (click)="onCancel()">Cancelar</button>
    </div>
  </form>
</div>

  `,
  styles: [`
.form-container {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.mat-form-field {
  flex: 1;
  margin-bottom: 20px; 
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}


  `],
})
export class MiembrosFormComponent implements OnInit {
  miembroForm: FormGroup;
  actividades: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private actividadService: ActividadService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MiembrosFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.miembroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: [''],
      fechaNacimiento: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      actividades: [[], Validators.required],
      observaciones: [''],
      fechaAlta: [new Date().toISOString().split('T')[0]], 
    });
  }

  ngOnInit(): void {
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.miembroService.obtenerActividades().subscribe({
      next: (data) => {
        this.actividades = data;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar actividades.', 'Cerrar', { duration: 3000 });
      },
    });
  }


  onSubmit(): void {
    if (this.miembroForm.valid) {
      const miembroData = this.miembroForm.value;

      // Crear una lista de observables para obtener las actividades
      const actividadObservables = miembroData.actividades.map((actividadId: string) =>
        this.actividadService.getActividad(actividadId)
      );

      // Ejecutar todas las llamadas al servicio y esperar sus resultados
      forkJoin(actividadObservables).subscribe((actividades: any) => {
        const socioPayload: Miembro = {
          nombre: miembroData.nombre,
          apellidos: miembroData.apellidos,
          direccion: miembroData.direccion,
          telefono: miembroData.telefono,
          fechaNacimiento: miembroData.fechaNacimiento,
          observaciones: miembroData.observaciones,
          fechaAlta: miembroData.fechaAlta,
          inscripciones: actividades.map((actividad: { id: any; nombre: any; costo: any; }) => ({
            actividad: {
              id: actividad.id,
              nombre: actividad.nombre,
              costo: actividad.costo,
            },
            fechaAlta: miembroData.fechaAlta,
          })),
        };

        // Crear el miembro
        this.miembroService.crearMiembro(socioPayload).subscribe({
          next: (response) => {
            this.snackBar.open('Socio creado con éxito', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackBar.open('Error al crear socio', 'Cerrar', { duration: 3000 });
            console.error(err);
          }
        });
      }
      )
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}