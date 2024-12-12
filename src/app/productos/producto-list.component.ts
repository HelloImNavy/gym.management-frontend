import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatSelectModule } from '@angular/material/select'; 
import { MatTableModule } from '@angular/material/table'; 
import { MatIconModule } from '@angular/material/icon'; 
import { ProductoService } from '../services/producto.service'; 
import { ProductoFormComponent } from './producto-form.component';

@Component({
  selector: 'app-producto-list',
  standalone : true, 
  imports: [ CommonModule, MatTableModule, MatIconModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule ],
  template: `
<div class="container">
  <div class="header">
    <h2>Inventario de Productos</h2>
    <button mat-raised-button color="primary" (click)="openProductoForm()">Nuevo Producto</button>
  </div>
  <div class="filters">
    <mat-form-field appearance="fill" class="filter-field">
      <mat-label>Buscar por nombre</mat-label>
      <input matInput [(ngModel)]="searchNombre" (input)="searchByNombre()">
    </mat-form-field>
    <mat-form-field appearance="fill" class="filter-field">
      <mat-label>Categoría</mat-label>
      <mat-select [(ngModel)]="searchCategoria" (selectionChange)="searchByCategoria()">
        <mat-option value="">Todos</mat-option>
        <mat-option *ngFor="let categoria of categorias" [value]="categoria">{{ categoria }}</mat-option>
      </mat-select>
    </mat-form-field>
  </div>
  <table mat-table [dataSource]="productos" class="mat-elevation-z8">
    <ng-container matColumnDef="nombre">
      <th mat-header-cell *matHeaderCellDef> Nombre </th>
      <td mat-cell *matCellDef="let producto"> {{producto.nombre}} </td>
    </ng-container>

    <ng-container matColumnDef="precio">
      <th mat-header-cell *matHeaderCellDef> Precio </th>
      <td mat-cell *matCellDef="let producto"> {{producto.precio | currency:'EUR':'symbol':'1.2-2'}} </td>
    </ng-container>

    <ng-container matColumnDef="cantidad">
      <th mat-header-cell *matHeaderCellDef> Cantidad </th>
      <td mat-cell *matCellDef="let producto"> {{producto.cantidad}} </td>
    </ng-container>

    <ng-container matColumnDef="categoria">
      <th mat-header-cell *matHeaderCellDef> Categoría </th>
      <td mat-cell *matCellDef="let producto"> {{producto.categoria}} </td>
    </ng-container>

    <ng-container matColumnDef="acciones">
      <th mat-header-cell *matHeaderCellDef> Acciones </th>
      <td mat-cell *matCellDef="let producto">
        <button mat-icon-button color="primary" (click)="editProducto(producto)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="deleteProducto(producto.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>
</div>

  `,
  styles: [ `
  .container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .filters {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .filter-field {
    width: 45%;
  }
  
  .mat-elevation-z8 {
    margin-top: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  ` ],
})
export class ProductoListComponent implements OnInit {
  productos: any[] = [];
  searchNombre: string = '';
  searchCategoria: string = '';
  categorias: string[] = ['Suplementación', 'Ropa', 'Alimentación', 'Bebidas', 'Accesorios'];
  displayedColumns: string[] = ['nombre', 'precio', 'cantidad', 'categoria', 'acciones']; 
  constructor(private productoService: ProductoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos() {
    this.productoService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  searchByNombre() {
    this.productoService.searchProductos(this.searchNombre, this.searchCategoria).subscribe(data => {
      this.productos = data;
    });
  }

  searchByCategoria() {
    this.productoService.searchProductos(this.searchNombre, this.searchCategoria).subscribe(data => {
      this.productos = data;
    });
  }

  openProductoForm(): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProductos();
      }
    });
  }

  editProducto(producto: any): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '400px',
      data: producto
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProductos();
      }
    });
  }

  deleteProducto(id: number): void {
    this.productoService.deleteProducto(id).subscribe(() => {
      this.loadProductos();
    });
  }
}
