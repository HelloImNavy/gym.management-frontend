import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MiembroService } from '../services/miembro.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-miembro-detail',
  standalone: true, 
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  template: `
<!-- miembro-detail.component.html -->
<h2>Detalles del Miembro</h2>
<form [formGroup]="miembroForm" (ngSubmit)="onSave()">
  <div class="row">
    <div class="column">
      <mat-form-field appearance="fill">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="nombre" [disabled]="!isEditing">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Apellidos</mat-label>
        <input matInput formControlName="apellidos" [disabled]="!isEditing">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Dirección</mat-label>
        <input matInput formControlName="direccion" [disabled]="!isEditing">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Nacimiento</mat-label>
        <input matInput formControlName="fechaNacimiento" [disabled]="!isEditing">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="telefono" [disabled]="!isEditing">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Observaciones</mat-label>
        <input matInput formControlName="observaciones" [disabled]="!isEditing">
      </mat-form-field>
    </div>
    <div class="column">
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Alta</mat-label>
        <input matInput formControlName="fechaAlta" [disabled]="true">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Fecha de Baja</mat-label>
        <input matInput formControlName="fechaBaja" type="date" [disabled]="!isEditing">
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="!isEditing">Guardar</button>
      <button mat-button (click)="onClose()">Cerrar</button>
      <button mat-raised-button color="accent" (click)="toggleEdit()">{{ isEditing ? 'Cancelar' : 'Editar' }}</button>
    </div>
  </div>
  <!-- Aquí se mostrarán las actividades y el listado de meses -->
  <div class="activities-section">
    <h3>Actividades</h3>
    <ul>
      <li *ngFor="let actividad of data.actividades">{{ actividad.nombre }}</li>
    </ul>
  </div>
  <div class="payments-section">
    <h3>Pagos</h3>
    <div class="months">
      <div *ngFor="let month of data.months" class="month">
        {{ month }}
        <mat-icon *ngIf="!month.pending" color="primary">check_circle</mat-icon>
      </div>
    </div>
  </div>
</form>

`,
styles: [`

  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .column {
    flex: 0 0 48%;
  }
  
  .activities-section, .payments-section {
    margin-top: 20px;
  }
  
  .months {
    display: flex;
    flex-wrap: wrap;
  }
  
  .month {
    flex: 0 0 25%;
    display: flex;
    align-items: center;
  }
  `]
})
export class MiembroDetailComponent implements OnInit {
  miembroForm: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private dialogRef: MatDialogRef<MiembroDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.miembroForm = this.fb.group({
      nombre: [{ value: data?.nombre || '', disabled: true }],
      apellidos: [{ value: data?.apellidos || '', disabled: true }],
      direccion: [{ value: data?.direccion || '', disabled: true }],
      fechaNacimiento: [{ value: data?.fechaNacimiento || '', disabled: true }],
      telefono: [{ value: data?.telefono || '', disabled: true }],
      observaciones: [{ value: data?.observaciones || '', disabled: true }],
      fechaAlta: [{ value: data?.fechaAlta || '', disabled: true }],
      fechaBaja: [data?.fechaBaja || null],
    });
    
  }
  

  ngOnInit(): void {
    if (!this.data.actividades || !this.data.months) {
      this.miembroService.getDetallesMiembro(this.data.id).subscribe((detalles) => {
        this.data.actividades = detalles.actividades || [];
        this.data.months = detalles.months || [];
      });
    }
  }
  

  onSave(): void {
    if (this.miembroForm.valid) {
      const updatedData = {
        ...this.data,
        ...this.miembroForm.value
      };
  
      this.miembroService.actualizarMiembro(this.data.id, updatedData).subscribe(() => {
        this.dialogRef.close(true); 
      }, error => {
        console.error('Error al actualizar el miembro:', error); 
      });
    }
  }
  

  toggleEdit(): void { 
    this.isEditing = !this.isEditing; 
    Object.keys(this.miembroForm.controls).forEach((control) => { 
      if (control !== 'fechaAlta') { 
        const formControl = this.miembroForm.get(control); 
        if (formControl) { 
          if (this.isEditing) { 
            formControl.enable(); 
          } else { 
            formControl.disable(); 
          } 
        } 
      } 
    }); 
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
