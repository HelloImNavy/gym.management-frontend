import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MiembroService } from '../services/miembro.service';
import { Miembro } from '../models/miembro.model'; 

@Component({
  selector: 'app-miembros-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  template: `
    <div class="form-container">
      <h2>Nuevo Socio</h2>
      <form [formGroup]="miembroForm" (ngSubmit)="onSubmit()">
        <!-- Otros campos del formulario -->

        <mat-form-field appearance="fill">
          <mat-label>Fecha de Alta</mat-label>
          <input matInput formControlName="fechaAlta" type="date" />
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!miembroForm.valid">
            Guardar
          </button>
          <button mat-button color="warn" (click)="onCancel()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `.form-container { padding: 30px; max-width: 700px; margin: 0 auto; }`
  ]
})
export class MiembrosFormComponent implements OnInit {
  miembroForm: FormGroup;
  actividades: any[] = [];

  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MiembrosFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.miembroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      actividades: [[], Validators.required],
      observaciones: [''],
      fechaAlta: [new Date().toISOString().split('T')[0]], // Fecha actual por defecto
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

      // Aseguramos que la fecha se convierte al formato correcto para el backend (yyyy-MM-dd)
      const fechaAlta = new Date(miembroData.fechaAlta);
      const formattedFechaAlta = fechaAlta.toISOString().split('T')[0]; // 'yyyy-MM-dd'

      const payload: Miembro = {
        nombre: miembroData.nombre,
        apellidos: miembroData.apellidos,
        direccion: miembroData.direccion,
        telefono: miembroData.telefono,
        fechaNacimiento: miembroData.fechaNacimiento,
        observaciones: miembroData.observaciones,
        inscripciones: miembroData.actividades.map((actividadId: number) => ({
          actividadId: actividadId,
          fechaAlta: formattedFechaAlta, // Usamos la fecha formateada
        })),
      };

      // Enviar al servicio
      this.miembroService.crearMiembro(payload).subscribe({
        next: () => {
          this.snackBar.open('Socio añadido con éxito.', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true); // Cerrar el popup
        },
        error: (err) => {
          this.snackBar.open('Error al añadir socio.', 'Cerrar', { duration: 3000 });
          console.error(err);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
