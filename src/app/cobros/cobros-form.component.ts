import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CobrosService } from '../services/cobros.service';
import { CobroDTO } from '../models/cobro.model';

@Component({
  selector: 'app-cobro-form',
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
    <h1 mat-dialog-title>{{ isEditing ? 'Editar Cobro' : 'Nuevo Cobro' }}</h1>
    <div mat-dialog-content>
      <form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Nombre del socio</mat-label>
          <input matInput formControlName="miembroNombre">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Apellidos del socio</mat-label>
          <input matInput formControlName="miembroApellidos">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Concepto</mat-label>
          <input matInput formControlName="concepto">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Fecha</mat-label>
          <input matInput formControlName="fecha" type="date">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Monto</mat-label>
          <input matInput formControlName="monto" type="number">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="PENDIENTE">Pendiente</mat-option>
            <mat-option value="PAGADO">Pagado</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-button type="submit" [disabled]="cobroForm.invalid">{{ isEditing ? 'Guardar Cambios' : 'Crear Cobro' }}</button>
      </form>
    </div>
  `
})
export class CobroFormComponent {
  cobroForm: FormGroup;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private cobrosService: CobrosService,
    public dialogRef: MatDialogRef<CobroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CobroDTO
  ) {
    this.isEditing = !!data;
    this.cobroForm = this.fb.group({
      miembroNombre: [{ value: data?.miembroNombre || '', disabled: this.isEditing }, Validators.required],
      miembroApellidos: [{ value: data?.miembroApellidos || '', disabled: this.isEditing }, Validators.required],
      concepto: [data?.concepto || '', Validators.required],
      fecha: [data?.fecha || '', Validators.required],
      monto: [data?.monto || '', Validators.required],
      estado: [data?.estado || 'PENDIENTE', Validators.required]
    });
  }

  onSubmit() {
    if (this.cobroForm.valid) {
      const cobro: CobroDTO = this.cobroForm.getRawValue();
      if (this.isEditing) {
        this.cobrosService.updateCobro(this.data.id, cobro).subscribe(() => this.dialogRef.close(true));
      } else {
        this.cobrosService.addCobro(cobro).subscribe(() => this.dialogRef.close(true));
      }
    }
  }
}
