import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductoService } from '../services/producto.service';
import { PagoProducto } from '../models/pago-producto.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos-editar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  template: `
    <h2>{{ data ? 'EDITAR PAGO' : 'NUEVO PAGO' }}</h2>
    <form [formGroup]="editPagoForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Pago</mat-label>
        <input matInput formControlName="fechaPago" [matDatepicker]="picker" placeholder="Ingrese la Fecha de Pago" required>
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Estado</mat-label>
        <mat-select formControlName="estado" required>
          <mat-option value="Pagado">Pagado</mat-option>
          <mat-option value="Pendiente">Pendiente</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Observaciones</mat-label>
        <textarea matInput formControlName="observaciones" placeholder="Ingrese las Observaciones"></textarea>
      </mat-form-field>

      <div class="form-actions">
        <button mat-raised-button class="granate-btn" type="submit" [disabled]="!editPagoForm.valid">Guardar</button>
        <button mat-button (click)="onCancel()">Cancelar</button>
      </div>
    </form>
  `,
  styles: [
    `
      h2 {
        font-size: 1.5rem;
        text-align: left;
        margin-left: 20px;
        margin-top: 10px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 20px;
      }

      .mat-form-field {
        width: 100%;
        margin-bottom: 10px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .granate-btn {
        background-color: #800000;
        color: white;
      }
    `
  ]
})
export class PagosEditarComponent {
  editPagoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PagosEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PagoProducto
  ) {
    this.editPagoForm = this.fb.group({
      fechaPago: [data.fechaPago, Validators.required],
      estado: [data.estado, Validators.required],
      observaciones: [data.observaciones, Validators.maxLength(500)],
    });
  }

  onSubmit(): void {
    if (this.editPagoForm.valid) {
      const updatedPago: PagoProducto = {
        ...this.data,
        fechaPago: this.editPagoForm.value.fechaPago,
        estado: this.editPagoForm.value.estado,
        observaciones: this.editPagoForm.value.observaciones,
      };

      this.productoService.updatePago(updatedPago.id!, updatedPago).subscribe({
        next: (response: any) => {
          this.snackBar.open('Pago actualizado con éxito', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(updatedPago);
        },
        error: (err: any) => {
          this.snackBar.open('Error al actualizar el pago', 'Cerrar', { duration: 3000 });
          console.error('Error al actualizar el pago', err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
