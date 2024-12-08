import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Miembro } from '../models/miembro.model';
import { MiembroService } from '../services/miembro.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-miembros-detalles',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Plantilla original -->
  `,
  styles: [
    `
      .contenedor {
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
      }
      section {
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      table,
      th,
      td {
        border: 1px solid #ddd;
      }
      th,
      td {
        text-align: left;
        padding: 8px;
      }
      th {
        background-color: #f4f4f4;
      }
    `
  ]
})
export class MiembrosDetallesComponent implements OnInit {
  historialAltasBajas: { fechaAlta: string; fechaBaja?: string }[] = [];
  actividadesInscritas: { nombre: string }[] = [];
  actividadesNoRealizadas: { nombre: string }[] = [];
  cobrosFiltrados: { mes: string; pagado: boolean; fechaPago?: string }[] = [];
  anoFiltro: number = new Date().getFullYear();

  constructor(
    @Inject(MAT_DIALOG_DATA) public miembro: Miembro,
    private dialogRef: MatDialogRef<MiembrosDetallesComponent>,
    private miembroService: MiembroService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarActividades();
    this.cargarCobros();
  }

  cargarHistorial(): void {
    this.miembroService.getHistorialAltasBajas(this.miembro.id!)
      .subscribe((historial: { fechaAlta: string; fechaBaja?: string }[]) => {
        this.historialAltasBajas = historial;
      });
  }

  cargarActividades(): void {
    this.miembroService.getActividadesInscritas(this.miembro.id!)
      .subscribe((actividades: { nombre: string }[]) => {
        this.actividadesInscritas = actividades;
      });

    this.miembroService.getActividadesNoRealizadas(this.miembro.id!)
      .subscribe((actividades: { nombre: string }[]) => {
        this.actividadesNoRealizadas = actividades;
      });
  }

  cargarCobros(): void {
    this.miembroService.getCobros(this.miembro.id!, this.anoFiltro)
      .subscribe((cobros: { mes: string; pagado: boolean; fechaPago?: string }[]) => {
        this.cobrosFiltrados = cobros;
      });
  }

  filtrarCobrosPorAno(): void {
    this.cargarCobros();
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
