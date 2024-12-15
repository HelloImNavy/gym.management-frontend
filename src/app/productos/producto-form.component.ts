import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-producto-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatSnackBarModule, 
        FormsModule
    ],
    template: `
<h2>{{ data ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
<form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
  <mat-form-field appearance="fill">
    <mat-label>Nombre</mat-label>
    <input matInput formControlName="nombre" required>
  </mat-form-field>
  <mat-form-field appearance="fill">
    <mat-label>Precio (€)</mat-label>
    <input matInput [(ngModel)]="precio" (input)="onPrecioInput($event)" required>
  </mat-form-field>
  <mat-form-field appearance="fill">
    <mat-label>Cantidad</mat-label>
    <input matInput formControlName="cantidad" type="number" required>
  </mat-form-field>
  <mat-form-field appearance="fill">
    <mat-label>Categoría</mat-label>
    <mat-select formControlName="categoria" required>
      <mat-option value="Electrónica">Suplementación</mat-option>
      <mat-option value="Ropa">Ropa</mat-option>
      <mat-option value="Alimentos">Alimentos</mat-option>
      <mat-option value="Alimentos">Bebidas</mat-option>
      <mat-option value="Alimentos">Accesorios</mat-option>
    </mat-select>
  </mat-form-field>
  <div class="form-actions">
    <button mat-raised-button color="primary" type="submit" [disabled]="!productoForm.valid">Guardar</button>
    <button mat-button color="warn" (click)="onCancel()">Cancelar</button>
  </div>
</form>
  `,
    styles: [
        `h2 { text-align: center; margin-bottom: 20px; } 
        form { display: flex; flex-direction: column; gap: 20px; } 
        .mat-form-field { width: 100%; } 
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; }
    `
    ]
})
export class ProductoFormComponent implements OnInit {
    productoForm: FormGroup;
    precio: string = ''; // Añadir variable para el precio
  
    constructor(
      private fb: FormBuilder,
      private productoService: ProductoService,
      private snackBar: MatSnackBar,
      private dialogRef: MatDialogRef<ProductoFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.productoForm = this.fb.group({
        nombre: [data ? data.nombre : '', Validators.required],
        precio: [data ? data.precio : '', [Validators.required, Validators.min(0)]],
        cantidad: [data ? data.cantidad : '', [Validators.required, Validators.min(0)]],
        categoria: [data ? data.categoria : '', Validators.required]
      });
    }
  
    ngOnInit(): void {}
  
    onSubmit(): void {
      if (this.productoForm.valid) {
        if (this.data) {
          this.productoService.updateProducto(this.data.id, this.productoForm.value).subscribe({
            next: () => {
              this.snackBar.open('Producto actualizado con éxito', 'Cerrar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              this.snackBar.open('Error al actualizar producto', 'Cerrar', { duration: 3000 });
              console.error(err);
            }
          });
        } else {
          this.productoService.addProducto(this.productoForm.value).subscribe({
            next: () => {
              this.snackBar.open('Producto registrado con éxito', 'Cerrar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              this.snackBar.open('Error al registrar producto', 'Cerrar', { duration: 3000 });
              console.error(err);
            }
          });
        }
      }
    }

    onPrecioInput(event: any): void {
        let value = event.target.value;
        
        // Depuración: mostrar el valor
        console.log('Valor del precio:', value);

        // Reemplazar la coma por un punto para asegurarse de que se maneje correctamente
        value = value.replace(',', '.');
        
        // Verificar si el valor es un número válido
        if (!isNaN(parseFloat(value))) {
          this.precio = value;  // Actualizar la variable precio
          this.productoForm.controls['precio'].setValue(value);  // Actualizar el control de formulario
        } else {
          // Si el valor no es un número, borrar el campo o manejar el error
          this.precio = '';  // Limpiar el valor
          this.productoForm.controls['precio'].setValue('');  // Limpiar el campo
        }
    }

    onCancel(): void {
      this.dialogRef.close();
    }
}
