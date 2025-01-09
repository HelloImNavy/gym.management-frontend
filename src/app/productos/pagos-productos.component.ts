import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, forkJoin, Subject } from 'rxjs';
import { MiembroService } from '../services/miembro.service';
import { ProductoService } from '../services/producto.service';
import { PagoProducto } from '../models/pago-producto.model';

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
    <h2 mat-dialog-title style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">NUEVO PAGO</h2>
<form [formGroup]="pagoForm" (ngSubmit)="onSubmit()">
  <mat-dialog-content style="padding: 20px;">
    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Tipo de Comprador</mat-label>
      <mat-select formControlName="tipoComprador" (selectionChange)="onTipoCompradorChange($event)">
        <mat-option value="Socio">Socio</mat-option>
        <mat-option value="Externo">Externo</mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="pagoForm.get('tipoComprador')?.value === 'Socio'">
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Buscar Socio</mat-label>
        <input matInput (input)="buscarSocio($event)" placeholder="Ingrese el Nombre/Apellido del Socio">
      </mat-form-field>

      <mat-list *ngIf="sociosFiltrados.length > 0">
        <mat-list-item *ngFor="let socio of sociosFiltrados | slice:0:10" (click)="seleccionarSocio(socio)">
          {{ socio.nombre }} {{ socio.apellidos }}
        </mat-list-item>
      </mat-list>

      <div *ngIf="sociosFiltrados.length === 0 && pagoForm.get('nombreComprador')?.value.trim() === ''" class="no-results">
        No se encontraron socios con ese nombre/apellido.
      </div>
    </div>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Nombre del Comprador</mat-label>
      <input matInput 
            formControlName="nombreComprador" 
            [attr.placeholder]="pagoForm.get('tipoComprador')?.value === 'Socio' ? 'Socio Seleccionado' : 'Ingrese el Nombre del Comprador'"
            [readonly]="pagoForm.get('tipoComprador')?.value === 'Socio'">
    </mat-form-field>

    <div class="form-section">
      <h4>Productos Seleccionados:</h4>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Buscar Producto</mat-label>
        <input matInput (input)="buscarProducto($event)" placeholder="Ingrese el nombre del producto">
      </mat-form-field>

      <mat-list>
        <mat-list-item *ngFor="let producto of productosFiltrados" (click)="seleccionarProducto(producto)">
          {{producto.nombre}} - Precio: {{producto.precio}} - Stock: {{producto.cantidad}}
        </mat-list-item>
      </mat-list>

      <div *ngFor="let producto of productosSeleccionados; let i = index" class="producto-list-item">
        <span>{{producto.nombre}} (x{{producto.cantidad}})</span>
        <div class="cantidad-controls">
          <button mat-icon-button color="primary" (click)="ajustarCantidad(i, 1, $event)">
            <mat-icon>add</mat-icon>
          </button>
          <button mat-icon-button color="warn" [disabled]="producto.cantidad <= 1" (click)="ajustarCantidad(i, -1, $event)">
            <mat-icon>remove</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="eliminarProducto(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Descuento (%)</mat-label>
      <input matInput formControlName="descuento" type="number" placeholder="Ingrese el % de descuento" (input)="actualizarImporteTotal()" min="0" max="100">
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Importe Total (con Descuento)</mat-label>
      <input matInput [value]="importeConDescuento | number:'1.2-2'" placeholder="Importe con descuento" readonly>
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Estado</mat-label>
      <mat-select formControlName="estado" (selectionChange)="onEstadoChange($event)">
        <mat-option value="Pagado">Pagado</mat-option>
        <mat-option value="Pendiente">Pendiente</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Fecha de Pago</mat-label>
      <input matInput formControlName="fechaPago" placeholder="Ingrese la Fecha de Pago (dd/mm/yyyy)" [disabled]="pagoForm.get('estado')?.value !== 'PAGADO'">
    </mat-form-field>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Observaciones</mat-label>
      <textarea matInput formControlName="observaciones" placeholder="Ingrese las Observaciones"></textarea>
    </mat-form-field>
  </mat-dialog-content>

  <mat-dialog-actions align="end" style="padding: 16px;">
    <button mat-raised-button color="primary" type="submit" [disabled]="!pagoForm.valid" style="background-color: #800000; color: white;">Guardar</button>
    <button mat-button mat-dialog-close>Cancelar</button>
  </mat-dialog-actions>
</form>

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

    mat-list {
      max-height: 200px; 
    }

    .no-results {
      color: red;
      font-style: italic;
      text-align: center;
      padding: 10px;
    }

    @media (max-width: 1000px) {
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
          gap: 20px;
        }
      }

      button[mat-button], button[mat-raised-button] {
        font-size: 14px;
        border-radius: 4px;
        padding: 8px 16px;
      }

      button[mat-button] {
        background-color: transparent;
        color: black;
      }


  `],
})
export class PagosProductosComponent implements OnInit {
  pagoForm!: FormGroup;
  productosFiltrados: any[] = [];
  sociosFiltrados: any[] = [];
  productosSeleccionados: any[] = [];
  socios: any[] = [];
  socioSearchSubject = new Subject<string>();
  productos: any[] = [];
  importeConDescuento: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PagosProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private miembroService: MiembroService,
    private cdr: ChangeDetectorRef,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.pagoForm = this.fb.group({
      tipoComprador: ['Socio', Validators.required],
      nombreComprador: [''],
      importeTotal: [0, Validators.required],
      fechaPago: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      observaciones: [''],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
    });

    // Cargar productos
    this.productoService.getProductos().subscribe({
      next: (productos: any[]) => {
        this.productos = productos;
      },
      error: (err: any) => console.error('Error al cargar productos', err),
    });

    // Cargar miembros
    this.miembroService.getMiembros().subscribe({
      next: (miembros: any) => {
        this.socios = miembros;
      },
      error: (err: any) => console.error('Error al cargar miembros', err),
    });

    this.socioSearchSubject.pipe(debounceTime(300)).subscribe((query: string) => this.realizarBusquedaSocios(query));

    this.onEstadoChange({ value: this.pagoForm.get('estado')?.value });

    this.onTipoCompradorChange({ value: this.pagoForm.get('tipoComprador')?.value });
  }


  buscarProducto(event: any): void {
    const query = event.target.value.trim().toLowerCase();
    console.log('Query de búsqueda:', query); // Log para verificar el query

    if (!query) {
      this.productosFiltrados = [];
      console.log('No hay query, lista vacía.'); // Mensaje si no hay búsqueda
      return;
    }

    this.productosFiltrados = this.productos.filter(producto => {
      const coincidencia = producto.nombre.toLowerCase().includes(query) && producto.cantidad > 0;
      if (coincidencia) {
        console.log(`Producto coincide:`, producto); // Log de productos que coinciden
      }
      return coincidencia;
    });

    console.log('Productos filtrados:', this.productosFiltrados); // Log para verificar los filtrados
  }

  onEstadoChange(event: any): void {
    const estado = event.value;

    // Deshabilitamos la fecha de pago si no es 'PAGADO'
    if (estado === 'PAGADO') {
      this.pagoForm.get('fechaPago')?.enable();
    } else {
      this.pagoForm.get('fechaPago')?.disable();
      this.pagoForm.get('fechaPago')?.clearValidators();
    }

    // Aseguramos que los validadores se actualicen
    this.pagoForm.get('fechaPago')?.updateValueAndValidity();
  }

  actualizarStockProductos(productos: { id: number, cantidad: number }[]): void {
    productos.forEach(producto => {
      this.productoService.restarStock(producto.id, producto.cantidad).subscribe({
        next: () => {
          console.log(`Stock actualizado para producto con ID: ${producto.id}`);
        },
        error: (err) => {
          console.error(`Error al actualizar stock para producto con ID: ${producto.id}`, err);
        }
      });
    });
  }

  // Función para seleccionar un producto (ya existente)
  seleccionarProducto(producto: any): void {
    const productoExistente = this.productosSeleccionados.find(p => p.id === producto.id);

    if (productoExistente) {
      // Si el producto ya está seleccionado, aumentamos la cantidad
      productoExistente.cantidad++;
    } else {
      // Si no, lo añadimos con cantidad inicial 1
      this.agregarProducto(producto);
    }

    // Actualizamos el importe total después de añadir el producto
    this.actualizarImporteTotal();
    this.productosFiltrados = [];
  }

  onPrecioInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Reemplazar coma por punto
    value = value.replace(',', '.');

    // Validar si el valor es un número válido
    if (!isNaN(parseFloat(value))) {
      this.productosSeleccionados[index].precio = parseFloat(value);
    } else {
      this.productosSeleccionados[index].precio = 0;
    }

    this.actualizarImporteTotal();
  }

  // Esta función maneja el cambio de tipo de comprador
  onTipoCompradorChange(event: any): void {
    if (event.value === 'socio') {
      // Habilitamos el campo 'nombreComprador' para buscar un socio
      this.pagoForm.get('nombreComprador')?.disable();
    } else {
      // Deshabilitamos el campo 'nombreComprador' para escribir el nombre de comprador externo
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
  actualizarImporteTotal(emitEvent: boolean = true): void {
    const total = this.productosSeleccionados.reduce(
      (acc, producto) => acc + (producto.precio * producto.cantidad),
      0
    );

    // Actualiza el importe total sin emitir eventos si `emitEvent` es falso
    this.pagoForm.get('importeTotal')?.setValue(total, { emitEvent });

    // Aplica el descuento
    const descuento = this.pagoForm.get('descuento')?.value || 0;
    this.importeConDescuento = total - (total * (descuento / 100));
  }

  ajustarCantidad(index: number, cambio: number, event: Event): void {
    event.preventDefault();
    const producto = this.productosSeleccionados[index];

    // Asegurarse de que la cantidad no sea menor a 1
    if (producto.cantidad + cambio >= 1) {
      producto.cantidad += cambio;
    }

    // Actualizar el importe total sin emitir eventos de validación
    this.actualizarImporteTotal(false);
  }




  // Función para manejar el submit del formulario
  onSubmit() {
    if (this.pagoForm.valid) {
      // Crear el objeto de pago con el formato esperado
      const pagoData: PagoProducto = {
        tipoComprador: this.pagoForm.get('tipoComprador')?.value || 'Externo', // Puede ser 'socio' o 'externo'
        productos: this.productosSeleccionados.map((producto: any) => producto.nombre + "(" + producto.cantidad + ")"),
        importeTotal: this.pagoForm.get('importeTotal')?.value,
        fechaPago: this.pagoForm.get('fechaPago')?.value,
        estado: this.pagoForm.get('estado')?.value,
        nombreComprador: this.pagoForm.get('nombreComprador')?.value,
        observaciones: this.pagoForm.get('observaciones')?.value,
      };

      // Si el comprador es un socio, añadir la información del miembro
      if (this.pagoForm.get('tipoComprador')?.value === 'Socio') {
        const miembro = this.socios.find(
          (socio) => socio.nombre === this.pagoForm.get('nombreComprador')?.value
        );
        if (miembro) {
          pagoData.socioId = miembro.id;
        }
      }

      // Preparar las llamadas para restar el stock
      const stockRequests = this.productosSeleccionados.map((producto: any) =>
        this.productoService.restarStock(producto.id, producto.cantidad)
      );

      // Ejecutar las llamadas al stock en paralelo
      forkJoin(stockRequests).subscribe({
        next: (responses) => {
          console.log('Stock actualizado exitosamente:', responses);
          // Si todas las actualizaciones del stock son exitosas, registrar el pago
          this.productoService.registrarPago(pagoData).subscribe({
            next: (pagoResponse) => {
              console.log('Pago registrado con éxito:', pagoResponse);
              this.dialogRef.close(pagoResponse); // Cerrar el diálogo o procesar respuesta
            },
            error: (err) => {
              console.error('Error al registrar el pago:', err);
            },
          });
        },
        error: (err) => {
          console.error('Error al actualizar stock:', err);
          alert('No se pudo actualizar el stock. Intente nuevamente.');
        },
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  buscarSocio(event: any): void {
    const query = event.target.value.trim().toLowerCase();

    if (query.length < 3) {
      this.sociosFiltrados = [];
      return;
    }

    this.socioSearchSubject.next(query);
  }


  realizarBusquedaSocios(query: string): void {
    console.log('Realizando búsqueda de socios con query:', query); // Verifica el valor de búsqueda

    // Asegúrate de que el valor de 'socios' contiene los socios correctamente
    this.sociosFiltrados = this.socios.filter((socio: { nombre: string, apellidos: string }) =>
      `${socio.nombre} ${socio.apellidos}`.toLowerCase().includes(query)
    );

    console.log('Socios filtrados:', this.sociosFiltrados); // Verifica si los resultados se están actualizando correctamente
  }

  seleccionarSocio(socio: any): void {
    // Actualiza el formulario con el nombre del socio seleccionado
    this.pagoForm.patchValue({
      nombreComprador: `${socio.nombre} ${socio.apellidos}`
    });

    // Limpiamos los resultados de búsqueda
    this.sociosFiltrados = [];

    // Deshabilitamos el campo si el tipo de comprador es 'socio'
    if (this.pagoForm.get('tipoComprador')?.value === 'Socio') {
      this.pagoForm.get('nombreComprador')?.disable();
    } else {
      this.pagoForm.get('nombreComprador')?.enable();
    }

    // Llamamos a updateValueAndValidity para asegurarnos de que el formulario se actualiza
    this.pagoForm.get('nombreComprador')?.updateValueAndValidity();
  }


  // Función para cerrar el dialogo
  onCancel(): void {
    this.dialogRef.close();
  }
}
