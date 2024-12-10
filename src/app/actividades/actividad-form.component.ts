import { Component } from '@angular/core';
import { ActividadService } from '../services/actividad.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-actividad-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <h2>{{ isEditing ? 'Editar Actividad' : 'Nueva Actividad' }}</h2>
    <form (ngSubmit)="guardarActividad()">
      <label>Nombre: <input [(ngModel)]="actividad.nombre" name="nombre" required></label>
      <label>Descripción: <input [(ngModel)]="actividad.descripcion" name="descripcion"></label>
      <label>Costo: <input [(ngModel)]="actividad.costo" name="costo" type="number" required></label>
      <label>Cupo: <input [(ngModel)]="actividad.cupo" name="cupo" type="number" required></label>
      <button type="submit">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
    </form>
  `
})
export class ActividadFormComponent {
  actividad: any = {};
  isEditing: boolean = false;

  constructor(private actividadService: ActividadService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditing = true;
          return this.actividadService.getActividad(id);
        } else {
          return new Observable();
        }
      })
    ).subscribe((actividad: any) => {
      if (actividad) {
        this.actividad = actividad;
      }
    });
  }

  guardarActividad() {
    if (this.isEditing) {
      this.actividadService.updateActividad(this.actividad).subscribe(() => {
        this.router.navigate(['/dashboard/actividades']);
      });
    } else {
      this.actividadService.saveActividad(this.actividad).subscribe(() => {
        this.router.navigate(['/dashboard/actividades']);
      });
    }
  }
}
