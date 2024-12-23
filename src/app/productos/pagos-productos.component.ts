import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Importar MiembroService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagos-productos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatListModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Nuevo Pago</h2>
    <mat-dialog-content>
      <form [formGroup]="pagoForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Tipo de Comprador</mat-label>
          <mat-select formControlName="tipoComprador" (selectionChange)="onTipoCompradorChange($event)">
            <mat-option value="socio">Socio</mat-option>
            <mat-option value="externo">Externo</mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="pagoForm.get('tipoComprador')?.value === 'socio'">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Buscar Socio</mat-label>
            <input matInput (input)="buscarSocio($event)" placeholder="Ingrese el Nombre/Apellido del Socio">
          </mat-form-field>
          <mat-list *ngIf="sociosFiltrados.length > 0">
            <mat-list-item *ngFor="let socio of sociosFiltrados" (click)="seleccionarSocio(socio)">
              {{socio.nombre}} {{socio.apellidos}}
            </mat-list-item>
          </mat-list>
        </div>

        <div *ngIf="pagoForm.get('tipoComprador')?.value === 'externo'">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Nombre del Comprador</mat-label>
            <input matInput formControlName="nombreComprador" placeholder="Ingrese el Nombre del Comprador">
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Productos</mat-label>
          <input matInput (input)="buscarProducto($event)" placeholder="Ingrese el Nombre del Producto">
        </mat-form-field>
        <mat-list *ngIf="productosFiltrados && productosFiltrados.length > 0">
          <mat-list-item *ngFor="let producto of productosFiltrados" (click)="seleccionarProducto(producto)">
            {{producto.nombre}} - Stock: {{producto.stock}}
          </mat-list-item>
        </mat-list>

        <div *ngIf="productosSeleccionados.length > 0">
          <h4>Productos Seleccionados:</h4>
          <mat-list>
            <mat-list-item *ngFor="let producto of productosSeleccionados; let i = index" class="producto-list-item">
              {{producto.nombre}} - Precio: {{producto.precio}}€
              <input
                type="number"
                [(ngModel)]="producto.cantidad"
                (ngModelChange)="actualizarImporteTotal()"
                min="1"
              />
              <button mat-icon-button color="warn" (click)="eliminarProducto(i)">
                <mat-icon>clear</mat-icon>
              </button>
            </mat-list-item>
          </mat-list>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Importe Total</mat-label>
          <input matInput formControlName="importeTotal" placeholder="Ingrese el Importe Total" type="number" readonly>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Fecha de Pago</mat-label>
          <input matInput formControlName="fechaPago" placeholder="Ingrese la Fecha de Pago (dd/mm/yyyy)">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="PAGADO">Pagado</mat-option>
            <mat-option value="PENDIENTE">Pendiente</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" placeholder="Ingrese las Observaciones"></textarea>
        </mat-form-field>

        <div mat-dialog-actions>
          <button mat-button type="submit" [disabled]="!pagoForm.valid">Guardar</button>
          <button mat-button mat-dialog-close>Cancelar</button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
    }
    .producto-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .producto-list-item input {
      width: 60px;
      margin-left: 16px;
    }
  `],
})
export class PagosProductosComponent implements OnInit {
  pagoForm: FormGroup;
  productosFiltrados: any[] = [];
  sociosFiltrados: any[] = [];
  productosSeleccionados: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PagosProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.pagoForm = this.fb.group({
      tipoComprador: ['', Validators.required],
      nombreComprador: [''],
      importeTotal: [{ value: '', disabled: true }],
      fechaPago: ['', Validators.required],
      estado: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.pagoForm = this.fb.group({
      tipoComprador: ['socio', Validators.required], // 'socio' por defecto
      nombreComprador: [''],
      importeTotal: [0, Validators.required],
      fechaPago: ['', Validators.required],
      estado: ['PENDIENTE', Validators.required],
      observaciones: ['']
    });

    this.onTipoCompradorChange({ value: this.pagoForm.get('tipoComprador')?.value });
  }

  // Esta función maneja el cambio de tipo de comprador
  onTipoCompradorChange(event: any): void {
    if (event.value === 'socio') {
      this.pagoForm.get('nombreComprador')?.disable();
    } else {
      this.pagoForm.get('nombreComprador')?.enable();
    }
  }

  // Agregar producto al array de productos seleccionados
  agregarProducto(producto: any) {
    this.productosSeleccionados.push({ ...producto, cantidad: 1 });
    this.actualizarImporteTotal();
  }

  // Eliminar producto del array de productos seleccionados
  eliminarProducto(index: number) {
    this.productosSeleccionados.splice(index, 1);
    this.actualizarImporteTotal();
  }

  // Actualizar el importe total
  actualizarImporteTotal() {
    const total = this.productosSeleccionados.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    this.pagoForm.get('importeTotal')?.setValue(total);
  }

  // Función para buscar productos
  buscarProducto(event: any) {
    const query = event.target.value.toLowerCase();
    this.productosFiltrados = this.data.productos.filter((producto: any) =>
      producto.nombre.toLowerCase().includes(query)
    );
  }

  // Función para seleccionar un producto
  seleccionarProducto(producto: any) {
    this.agregarProducto(producto);
    this.productosFiltrados = [];
  }

  // Función para manejar el submit del formulario
  onSubmit() {
    if (this.pagoForm.valid) {
      console.log(this.pagoForm.value);
      this.dialogRef.close(this.pagoForm.value);
    }
  }

    // Función para buscar socios
    buscarSocio(event: any): void {
      const query = event.target.value.toLowerCase();
      this.sociosFiltrados = this.data.socios.filter((socio: any) => 
        socio.nombre.toLowerCase().includes(query) || socio.apellidos.toLowerCase().includes(query)
      );
    }
  
    // Función para seleccionar un socio
    seleccionarSocio(socio: any) {
      this.pagoForm.patchValue({
        nombreComprador: socio.nombre
      });
      this.sociosFiltrados = [];
    }

  // Función para cerrar el dialogo
  onCancel(): void {
    this.dialogRef.close();
  }
}
