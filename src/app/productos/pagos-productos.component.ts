import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, forkJoin, Subject } from 'rxjs';
import { MiembroService } from '../services/miembro.service';
import { ProductoService } from '../services/producto.service';
import { PagoProducto } from '../models/pago-producto.model';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title style="text-align: left;">NUEVO PAGO</h2>
    <mat-dialog-content>
      <form [formGroup]="pagoForm" (ngSubmit)="onSubmit()">
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

          <div *ngIf="haBuscado && sociosFiltrados.length === 0" class="no-results">
            No se encontraron socios con ese nombre/apellido.
          </div>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre del Comprador</mat-label>
          <input matInput 
                formControlName="nombreComprador" 
                [attr.placeholder]="pagoForm.get('tipoComprador')?.value === 'Socio' ? 'Socio Seleccionado' : 'Ingrese el Nombre del Comprador'"
                [readonly]="pagoForm.get('tipoComprador')?.value === 'Socio'"
                (input)="buscarSocio($event)">
        </mat-form-field>

        <div class="form-section">
          <mat-form-field appearance="fill" class="full-width">
              <mat-label>Buscar Producto</mat-label>
              <input matInput (input)="buscarProducto($event)" placeholder="Ingrese el nombre del producto">
            </mat-form-field>
          <mat-list>
            <mat-list-item *ngFor="let producto of productosFiltrados" (click)="seleccionarProducto(producto)">
              {{producto.nombre}} - Precio: {{producto.precio}} - Stock: {{producto.cantidad}}
            </mat-list-item>
          </mat-list>

          <div *ngFor="let producto of productosSeleccionados; let i = index" class="producto-list-item" style="display: flex; justify-content: space-between; align-items: center;">
            <span>{{producto.nombre}} (x{{producto.cantidad}})</span>
            <div class="cantidad-controls" style="display: flex; gap: 8px;">
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
        <div class="row" style="display: flex; gap: 16px; align-items: center;">
          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Descuento (%)</mat-label>
            <input matInput formControlName="descuento" type="number" placeholder="Ingrese el % de descuento" (input)="actualizarImporteTotal()" min="0" max="100">
          </mat-form-field>

          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Importe Total</mat-label>
            <input matInput [value]="importeConDescuento | number:'1.2-2'" placeholder="Importe con descuento" readonly>
          </mat-form-field>
        </div>

        <div class="row" style="display: flex; gap: 16px; align-items: center;">
          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado" (selectionChange)="onEstadoChange($event)">
              <mat-option value="Pagado">Pagado</mat-option>
              <mat-option value="Pendiente">Pendiente</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Fecha de Pago</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaPago" [disabled]="pagoForm.get('estado')?.value !== 'PAGADO'"/>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" placeholder="Ingrese las Observaciones"></textarea>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button class="granate-btn save-button" type="submit" [disabled]="!pagoForm.valid">Guardar</button>
          <button mat-button (click)="onCancel()">Cancelar</button>
        </div>

      </form>
    </mat-dialog-content>
  `,
  styles: [`
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .half-width {
      width: 48%;
    }

    .row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

    button {
      padding: 8px 16px; 
      font-size: 16px; 
      border-radius: 4px; 
      transition: background-color 0.3s ease, transform 0.2s ease;
      border: none; 
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }


    button.mat-button {
      background-color:rgb(255, 255, 255); 
      color: black; 
    }

    .save-button {
      background-color: #800000;
      color: white;
    }

    .cantidad-controls button {
      padding: 4px 8px; 
      font-size: 14px;
      margin-left: 8px;
      margin-bottom: 16px;
    }

    .producto-list-item {
      margin-bottom: 16px; 
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
  haBuscado = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PagosProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private miembroService: MiembroService,
    private cdr: ChangeDetectorRef,
    private productoService: ProductoService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('es-ES');
  }

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

    this.productoService.getProductos().subscribe({
      next: (productos: any[]) => {
        this.productos = productos;
        console.log('Productos cargados:', this.productos); 
      },
      error: (err: any) => console.error('Error al cargar productos', err),
    });

    this.miembroService.getMiembros().subscribe({
      next: (miembros: any) => {
        this.socios = miembros;
        console.log('Miembros cargados:', this.socios); 
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

    if (estado === 'Pagado') {
      this.pagoForm.get('fechaPago')?.enable();
      this.pagoForm.get('fechaPago')?.setValidators([Validators.required]);
    } else {
      this.pagoForm.get('fechaPago')?.disable();
      this.pagoForm.get('fechaPago')?.clearValidators();
      this.pagoForm.get('fechaPago')?.setValue('');
    }

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

  seleccionarProducto(producto: any): void {
    const productoExistente = this.productosSeleccionados.find(p => p.id === producto.id);

    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      this.agregarProducto(producto);
    }

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

  onTipoCompradorChange(event: any): void {
    if (event.value === 'socio') {
      this.pagoForm.get('nombreComprador')?.disable();
    } else {
      this.pagoForm.get('nombreComprador')?.enable();
    }
  }

  agregarProducto(producto: any) {
    this.productosSeleccionados.push({ ...producto, cantidad: 1 });
    this.actualizarImporteTotal();
  }

  eliminarProducto(index: number) {
    this.productosSeleccionados.splice(index, 1);
    this.actualizarImporteTotal();
  }

  actualizarImporteTotal(emitEvent: boolean = true): void {
    const total = this.productosSeleccionados.reduce(
      (acc, producto) => acc + (producto.precio * producto.cantidad),
      0
    );

    this.pagoForm.get('importeTotal')?.setValue(total, { emitEvent });

    const descuento = this.pagoForm.get('descuento')?.value || 0;
    this.importeConDescuento = total - (total * (descuento / 100));
  }

  ajustarCantidad(index: number, cambio: number, event: Event): void {
    event.preventDefault();
    const producto = this.productosSeleccionados[index];

    if (producto.cantidad + cambio >= 1) {
      producto.cantidad += cambio;
    }

    this.actualizarImporteTotal(false);
  }

  onSubmit() {
    if (this.pagoForm.valid) {
      const pagoData: PagoProducto = {
        tipoComprador: this.pagoForm.get('tipoComprador')?.value || 'Externo', // Puede ser 'socio' o 'externo'
        productos: this.productosSeleccionados.map((producto: any) => producto.nombre + "(" + producto.cantidad + ")"),
        importeTotal: this.pagoForm.get('importeTotal')?.value,
        fechaPago: this.pagoForm.get('fechaPago')?.value,
        estado: this.pagoForm.get('estado')?.value,
        nombreComprador: this.pagoForm.get('nombreComprador')?.value,
        observaciones: this.pagoForm.get('observaciones')?.value,
      };

      if (this.pagoForm.get('tipoComprador')?.value === 'Socio') {
        const miembro = this.socios.find(
          (socio) => socio.nombre === this.pagoForm.get('nombreComprador')?.value
        );
        if (miembro) {
          pagoData.socioId = miembro.id;
        }
      }

      const stockRequests = this.productosSeleccionados.map((producto: any) =>
        this.productoService.restarStock(producto.id, producto.cantidad)
      );

      forkJoin(stockRequests).subscribe({
        next: (responses) => {
          console.log('Stock actualizado exitosamente:', responses);
          this.productoService.registrarPago(pagoData).subscribe({
            next: (pagoResponse) => {
              console.log('Pago registrado con éxito:', pagoResponse);
              this.dialogRef.close(pagoResponse); 
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
    this.haBuscado = query.length > 0;
    if (query.length < 3) {
      this.sociosFiltrados = [];
      return;
    }

    this.socioSearchSubject.next(query);
  }


  realizarBusquedaSocios(query: string): void {
    console.log('Realizando búsqueda de socios con query:', query); 

    this.sociosFiltrados = this.socios.filter((socio: { nombre: string, apellidos: string }) =>
      `${socio.nombre} ${socio.apellidos}`.toLowerCase().includes(query)
    );

    console.log('Socios filtrados:', this.sociosFiltrados); 
  }

  seleccionarSocio(socio: any): void {
    this.pagoForm.patchValue({
      nombreComprador: `${socio.nombre} ${socio.apellidos}`
    });

    this.sociosFiltrados = [];

    if (this.pagoForm.get('tipoComprador')?.value === 'Socio') {
      this.pagoForm.get('nombreComprador')?.disable();
    } else {
      this.pagoForm.get('nombreComprador')?.enable();
    }

    this.pagoForm.get('nombreComprador')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
