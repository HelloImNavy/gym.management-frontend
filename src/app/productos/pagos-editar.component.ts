import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProductoService } from '../services/producto.service';
import { PagoProducto } from '../models/pago-producto.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
  selector: 'app-pagos-editar',
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
    <h2 mat-dialog-title>Editar Pago</h2>
    <mat-dialog-content>
      <form [formGroup]="editPagoForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Fecha de Pago</mat-label>
          <input matInput formControlName="fechaPago" placeholder="Ingrese la Fecha de Pago (dd/mm/yyyy)" [matDatepicker]="picker">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="Pagado">Pagado</mat-option>
            <mat-option value="Pendiente">Pendiente</mat-option>
          </mat-select>
        </mat-form-field>


        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" placeholder="Ingrese las Observaciones"></textarea>
        </mat-form-field>

        <div mat-dialog-actions>
          <button mat-button type="submit" [disabled]="!editPagoForm.valid">Guardar</button>
          <button mat-button mat-dialog-close>Cancelar</button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class PagosEditarComponent {
  editPagoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    public dialogRef: MatDialogRef<PagosEditarComponent>,
    private dateAdapter: DateAdapter<Date>,
    @Inject(MAT_DIALOG_DATA) public data: PagoProducto
  ) {
    console.log('Datos recibidos en PagosEditarComponent:', data);
    // Iniciar el formulario con los datos actuales
    this.editPagoForm = this.fb.group({
      fechaPago: [data.fechaPago, Validators.required],
      estado: [data.estado, Validators.required],
      observaciones: [data.observaciones, Validators.maxLength(500)],
    });
    this.dateAdapter.setLocale('es-ES');
  }

  // Enviar los cambios de edición
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
          console.log('Pago actualizado con éxito', response);
          this.dialogRef.close(updatedPago);
        },
        error: (err: any) => {
          console.error('Error al actualizar el pago', err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
