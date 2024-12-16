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
  ],
  template: `
    <h2>Editar Cobro</h2>
    <form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="fill">
        <mat-label>Concepto:</mat-label>
        <input matInput formControlName="concepto" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Monto:</mat-label>
        <input matInput formControlName="monto" type="number" required>
      </mat-form-field>
      
      <mat-form-field appearance="fill">
        <mat-label>Estado:</mat-label>
        <mat-select formControlName="estado" required>
          <mat-option value="PENDIENTE">Pendiente</mat-option>
          <mat-option value="PAGADO">Pagado</mat-option>
        </mat-select>
      </mat-form-field>
      
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Pago:</mat-label>
        <input matInput formControlName="fechaPago" type="date">
      </mat-form-field>

      <button mat-button type="submit" [disabled]="cobroForm.invalid">Guardar</button>
      <button mat-button type="button" (click)="onCancel()">Cancelar</button>
    </form>
  `
})
export class EditCobroFormComponent implements OnInit {
  cobroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCobroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cobro: CobroDTO },
    private cobrosService: CobrosService
  ) {}

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
      fechaPago: [this.data.cobro.fechaPago ? new Date(this.data.cobro.fechaPago).toISOString().split('T')[0] : today, Validators.required]
    });

    console.log('Formulario inicializado con valores:', this.cobroForm.value);
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
