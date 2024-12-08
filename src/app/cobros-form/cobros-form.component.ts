import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MiembroService } from '../services/miembro.service';
import { MatSelectModule } from '@angular/material/select';
import { CobrosService } from '../services/cobros.service';
import { MatDialogRef } from '@angular/material/dialog'; 

@Component({
  selector: 'app-cobros-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  template: `
    <div class="form-container">
      <h2>Nuevo Cobro</h2>
      <form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Fecha</mat-label>
          <input matInput formControlName="fecha" type="date" required />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Socio</mat-label>
          <mat-select formControlName="socioId" required>
            <mat-option *ngFor="let miembro of miembros" [value]="miembro.id">
              {{ miembro.nombre }} {{ miembro.apellidos }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Concepto</mat-label>
          <input matInput formControlName="concepto" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Cantidad</mat-label>
          <input matInput formControlName="cantidad" type="number" required />
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!cobroForm.valid">
            Guardar
          </button>
          <button mat-button color="warn" (click)="onCancel()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
    }
    .form-actions {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }
  `],
})
export class CobrosFormComponent implements OnInit {
  cobroForm: FormGroup;
  miembros: any[] = [];

  constructor(
    private fb: FormBuilder,
    private miembroService: MiembroService,
    private cobrosService: CobrosService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CobrosFormComponent>,
  ) {
    this.cobroForm = this.fb.group({
      fecha: ['', Validators.required],
      socioId: ['', Validators.required],
      concepto: [''],
      cantidad: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    this.miembroService.getMiembros().subscribe({
      next: (miembros) => (this.miembros = miembros),
      error: () => {
        this.snackBar.open('Error al cargar los socios.', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSubmit(): void {
    if (this.cobroForm.valid) {
      const cobro = this.cobroForm.value;
      this.cobrosService.crearCobro(cobro).subscribe({
        next: () => {
          this.snackBar.open('Cobro añadido con éxito.', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error al añadir el cobro.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close(); 
  }
}
