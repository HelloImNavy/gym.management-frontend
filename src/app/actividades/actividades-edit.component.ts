import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actividad } from '../models/actividad.model';
import { ActividadService } from '../services/actividad.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-actividades-edit',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Editar Actividad</h2>
    <form [formGroup]="actividadForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput id="nombre" formControlName="nombre" placeholder="Nombre de la actividad" required />
          <mat-error *ngIf="actividadForm.controls['nombre'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Precio</mat-label>
          <input matInput id="precio" formControlName="precio" type="number" placeholder="Precio de la actividad" />
          <mat-error *ngIf="actividadForm.controls['precio'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Cupo Total</mat-label>
          <input matInput id="cupoTotal" formControlName="cupoTotal" type="number" placeholder="Cupo total de plazas" />
          <mat-error *ngIf="actividadForm.controls['cupoTotal'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Cupo Usado</mat-label>
          <input matInput id="cupoUsado" formControlName="cupoUsado" type="number" placeholder="Cupo usado" />
          <mat-error *ngIf="actividadForm.controls['cupoUsado'].hasError('required')">Este campo es obligatorio.</mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="actividadForm.invalid">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
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
  `]
})
export class ActividadesEditComponent {
  actividadForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ActividadesEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Actividad,
    private actividadService: ActividadService,
    private fb: FormBuilder
  ) {
    this.actividadForm = this.fb.group({
      nombre: [this.data.nombre, Validators.required],
      precio: [this.data.costo, [Validators.required, Validators.min(0)]],
      cupoTotal: [this.data.cupoTotal, [Validators.required, Validators.min(1)]],
      cupoUsado: [this.data.cupoUsado, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.actividadForm.valid) {
      const updatedActividad = { ...this.data, ...this.actividadForm.value };
      this.actividadService.updateActividad(updatedActividad).subscribe(() => {
        this.dialogRef.close(true);  
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);  
  }
}
