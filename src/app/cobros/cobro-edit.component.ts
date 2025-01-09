import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CobrosService } from '../services/cobros.service';
import { CobroDTO } from '../models/cobro.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-edit-cobro-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ],
  template: `
    <mat-card class="form-card">
      <h2 class="form-title">Editar Cobro</h2>
      <form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
        
        <div class="form-field">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Concepto:</mat-label>
            <input matInput formControlName="concepto" required>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Monto:</mat-label>
            <input matInput formControlName="monto" type="number" required>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Estado:</mat-label>
            <mat-select formControlName="estado" (selectionChange)="onEstadoChange()" required>
              <mat-option value="PENDIENTE">Pendiente</mat-option>
              <mat-option value="PAGADO">Pagado</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-field">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Fecha de Pago:</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaPago" [disabled]="cobroForm.get('estado')?.value === 'PENDIENTE'">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-buttons">
          <button mat-button type="submit" [disabled]="cobroForm.invalid" class="submit-btn">Guardar</button>
          <button mat-button type="button" (click)="onCancel()" class="cancel-btn">Cancelar</button>
        </div>
      </form>
    </mat-card>

    <style>
      /* General card styling */
      .form-card {
        width: 500px;
        padding: 20px;
        margin: 50px auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        background-color: #ffffff;
      }

      /* Title of the form */
      .form-title {
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px;
        color: #3f51b5;
        font-weight: 600;
      }

      /* Full-width form field */
      .full-width {
        width: 100%;
      }

      /* Form field wrappers */
      .form-field {
        margin-bottom: 15px;
      }

      /* Button container styling */
      .form-buttons {
        display: flex;
        justify-content: space-between;
        gap: 15px;
      }

      /* Submit button styling */
      .submit-btn {
        background-color: #4caf50;
        color: white;
        width: 48%;
        padding: 10px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .submit-btn:hover {
        background-color: #45a049;
      }

      /* Cancel button styling */
      .cancel-btn {
        background-color: #f44336;
        color: white;
        width: 48%;
        padding: 10px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .cancel-btn:hover {
        background-color: #e53935;
      }

      /* Responsive Design for smaller screens */
      @media (max-width: 600px) {
        .form-card {
          width: 90%;
          margin: 20px;
        }

        .form-buttons {
          flex-direction: column;
          gap: 10px;
        }

        .submit-btn, .cancel-btn {
          width: 100%;
        }
      }
    </style>
  `,

})
export class EditCobroFormComponent implements OnInit {
  cobroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCobroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cobro: CobroDTO },
    private cobrosService: CobrosService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('es-ES');
  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.data || !this.data.cobro) {
      console.error('Datos no recibidos correctamente');
      return;
    }

    this.cobroForm = this.fb.group({
      concepto: [this.data.cobro.concepto, Validators.required],
      monto: [this.data.cobro.monto, Validators.required],
      estado: [this.data.cobro.estado, Validators.required],
      fechaPago: [this.data.cobro.fechaPago ? new Date(this.data.cobro.fechaPago).toISOString().split('T')[0] : null]
    });

    // Llamamos al método para aplicar las reglas de deshabilitar fechaPago si el estado es PENDIENTE
    this.onEstadoChange();
  }

  onEstadoChange(): void {
    const estado = this.cobroForm.get('estado')?.value;
    const fechaPagoControl = this.cobroForm.get('fechaPago');

    if (estado === 'PENDIENTE') {
      fechaPagoControl?.disable(); // Deshabilitar la fecha de pago si el estado es PENDIENTE
      fechaPagoControl?.reset(); // Limpiar la fecha de pago
    } else {
      fechaPagoControl?.enable(); // Habilitar la fecha de pago si el estado es PAGADO
    }
  }

  onSubmit(): void {
    if (this.cobroForm.valid) {
      const cobroActualizado = { ...this.data.cobro, ...this.cobroForm.value };
      this.cobrosService.updateCobro(cobroActualizado.id, cobroActualizado).subscribe(() => {
        this.dialogRef.close(cobroActualizado);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
