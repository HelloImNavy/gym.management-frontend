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
    <h2 mat-dialog-title>EDITAR COBRO</h2>
<form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
  <mat-dialog-content>
    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Concepto</mat-label>
      <input matInput formControlName="concepto" placeholder="Concepto del cobro" required />
      <mat-error *ngIf="cobroForm.controls['concepto'].hasError('required')">Este campo es obligatorio.</mat-error>
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Monto</mat-label>
      <input matInput formControlName="monto" type="number" placeholder="Monto del cobro" required />
      <mat-error *ngIf="cobroForm.controls['monto'].hasError('required')">Este campo es obligatorio.</mat-error>
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Estado</mat-label>
      <mat-select formControlName="estado" (selectionChange)="onEstadoChange()" required>
        <mat-option value="PENDIENTE">Pendiente</mat-option>
        <mat-option value="PAGADO">Pagado</mat-option>
      </mat-select>
      <mat-error *ngIf="cobroForm.controls['estado'].hasError('required')">Este campo es obligatorio.</mat-error>
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Fecha de Pago</mat-label>
      <input matInput [matDatepicker]="picker" formControlName="fechaPago" [disabled]="cobroForm.get('estado')?.value === 'PENDIENTE'" />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-raised-button color="primary" type="submit" [disabled]="cobroForm.invalid" style="background-color: #800000; color: white;">Guardar</button>
    <button mat-button (click)="onCancel()">Cancelar</button>
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

  `
  ]
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

    if (!this.data || !this.data.cobro) {
      console.error('Datos no recibidos correctamente');
      return;
    }

    this.cobroForm = this.fb.group({
      concepto: [this.data.cobro.concepto, Validators.required],
      monto: [this.data.cobro.monto, Validators.required],
      estado: [this.data.cobro.estado, Validators.required],
      fechaPago: [this.data.cobro.fechaPago ? new Date(this.data.cobro.fechaPago) : null]
    });

    this.onEstadoChange();
  }

  onEstadoChange(): void {
    const estado = this.cobroForm.get('estado')?.value;
    const fechaPagoControl = this.cobroForm.get('fechaPago');

    if (estado === 'PENDIENTE') {
      fechaPagoControl?.disable(); 
      fechaPagoControl?.reset(); 
    } else {
      fechaPagoControl?.enable(); 
    }
  }

  onSubmit(): void {
    if (this.cobroForm.valid) {
      console.log(this.cobroForm.get("fechaPago")?.value);
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
