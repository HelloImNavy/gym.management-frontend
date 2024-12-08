import { Component } from '@angular/core';
import { CobrosListComponent } from '../cobros-list/cobros-list.component';
import { CobrosFormComponent } from '../cobros-form/cobros-form.component';

@Component({
  selector: 'app-cobros',
  standalone: true,
  imports: [
    CobrosListComponent,
    CobrosFormComponent,
  ], 
  template: `
    <div class="cobros-container">
      <h2>Buscar Movimientos</h2>

      <!-- Buscador -->
      <app-cobros-list></app-cobros-list>

      <!-- Botón para nuevo cobro -->
      <button (click)="abrirFormularioCobro()">Nuevo Cobro</button>

      <!-- Formulario de nuevo cobro -->
      <app-cobros-form *ngIf="mostrarFormulario" (cerrar)="cerrarFormularioCobro()"></app-cobros-form>
    </div>
  `
})
export class CobrosComponent {
  mostrarFormulario = false;

  abrirFormularioCobro() {
    this.mostrarFormulario = true;
  }

  cerrarFormularioCobro() {
    this.mostrarFormulario = false;
  }
}
