import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagos-productos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    CommonModule
  ],
  template: `
    <h2>Registrar Pago de Productos</h2>
    <form [formGroup]="pagoForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Nombre del Comprador</mat-label>
        <input matInput formControlName="nombreComprador">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Tipo de Comprador</mat-label>
        <mat-select formControlName="tipoComprador">
          <mat-option value="socio">Socio</mat-option>
          <mat-option value="externo">Externo</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="pagoForm.value.tipoComprador === 'socio'">
        <mat-label>ID del Socio</mat-label>
        <input matInput formControlName="socioId">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Productos</mat-label>
        <input matInput formControlName="productos">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Importe Total (€)</mat-label>
        <input matInput formControlName="importeTotal" type="number">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Fecha de Pago</mat-label>
        <input matInput formControlName="fechaPago" type="date">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Estado</mat-label>
        <mat-select formControlName="estado">
          <mat-option value="Pendiente">Pendiente</mat-option>
          <mat-option value="Pagado">Pagado</mat-option>
        </mat-select>
      </mat-form-field>
      <div class="form-actions">
        <button mat-button type="submit" [disabled]="pagoForm.invalid">Registrar Pago</button>
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
      </div>
    </form>
  `,
  styles: [`
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  `]
})
export class PagosProductosComponent implements OnInit {
  pagoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private snackBar: MatSnackBar
  ) {
    this.pagoForm = this.fb.group({
      nombreComprador: ['', Validators.required],
      tipoComprador: ['externo', Validators.required],
      socioId: [''],
      productos: ['', Validators.required],
      importeTotal: ['', [Validators.required, Validators.min(0)]],
      fechaPago: ['', Validators.required],
      estado: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.pagoForm.valid) {
      this.productoService.registrarPago(this.pagoForm.value).subscribe({
        next: () => {
          this.snackBar.open('Pago registrado con éxito', 'Cerrar', { duration: 3000 });
          this.pagoForm.reset();
        },
        error: (err) => {
          this.snackBar.open('Error al registrar el pago', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.pagoForm.reset();
  }
}
