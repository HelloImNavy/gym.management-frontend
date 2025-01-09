import { Component } from '@angular/core';
import { ActividadService } from '../services/actividad.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actividad-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva Actividad</h2>
    <form [formGroup]="actividadForm" (ngSubmit)="guardarActividad()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre de la actividad" required />
          <mat-error *ngIf="actividadForm.controls['nombre'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Precio</mat-label>
          <input matInput type="number" formControlName="costo" placeholder="Precio de la actividad" required />
          <mat-error *ngIf="actividadForm.controls['costo'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Cupo Total</mat-label>
          <input matInput type="number" formControlName="cupo" placeholder="Cupo total de plazas" required />
          <mat-error *ngIf="actividadForm.controls['cupo'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Cupo Usado</mat-label>
          <input matInput type="number" formControlName="cupoUsado" placeholder="Cupo usado" required />
          <mat-error *ngIf="actividadForm.controls['cupoUsado'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="actividadForm.invalid">
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }

      mat-dialog-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      mat-form-field {
        margin-bottom: 16px;
        width: 100%;
      }

      mat-dialog-actions {
        padding: 16px;
      }

      button[mat-button] {
        margin-right: 10px;
      }

      mat-error {
        font-size: 12px;
        color: red;
      }

      mat-raised-button {
        margin-top: 20px;
      }

      mat-dialog-content {
        padding: 20px;
      }

      
      @media (max-width: 768px) {
        mat-dialog-container {
          width: 80vw;
          padding: 10px;
        }

        .full-width {
          width: 100%;
        }

        mat-dialog-actions button {
          width: 100%;
          margin-top: 10px;
        }
      }

      @media (max-width: 380px) {
        mat-dialog-container {
          width: 95vw;
          padding: 5px;
        }

        .mat-form-field input,
        .mat-form-field select {
          font-size: 14px;
        }

        button {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class ActividadFormComponent {
  actividadForm: FormGroup;

  constructor(
    private actividadService: ActividadService,
    private router: Router,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ActividadFormComponent>
  ) {
    this.actividadForm = this.fb.group({
      nombre: ['', Validators.required],
      costo: ['', Validators.required],
      cupo: ['0', Validators.required],
      cupoUsado: ['0', Validators.required],
    });
  }

  ngOnInit() {}

  guardarActividad() {
    if (this.actividadForm.valid) {
      const actividadData = this.actividadForm.value;

      this.actividadService.saveActividad(actividadData).subscribe(() => {
        this.dialogRef.close(true);
        this.router.navigate(['/dashboard/actividades']);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
