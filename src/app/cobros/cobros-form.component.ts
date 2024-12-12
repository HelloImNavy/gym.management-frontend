import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CobrosService } from '../services/cobros.service';

@Component({
  selector: 'app-cobro-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <h2>Nuevo Cobro</h2>
    <form [formGroup]="cobroForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="fill">
        <mat-label>Concepto</mat-label>
        <input matInput formControlName="concepto" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Importe (€)</mat-label>
        <input matInput formControlName="importe" type="number" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Fecha</mat-label>
        <input matInput formControlName="fecha" type="date" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Estado</mat-label>
        <mat-select formControlName="estado" required>
          <mat-option value="Pendiente">Pendiente</mat-option>
          <mat-option value="Pagado">Pagado</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="!cobroForm.valid">Guardar</button>
      <button mat-button color="warn" (click)="onCancel()">Cancelar</button>
    </form>
  `,
  styles: [
    `
      h2 {
        text-align: center;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      mat-form-field {
        width: 100%;
      }
      button {
        align-self: flex-end;
      }
    `
  ]
})
export class CobroFormComponent implements OnInit {
  cobroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cobrosService: CobrosService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CobroFormComponent>
  ) {
    this.cobroForm = this.fb.group({
      concepto: ['', Validators.required],
      importe: ['', [Validators.required, Validators.min(0)]],
      fecha: ['', Validators.required],
      estado: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.cobroForm.valid) {
      this.cobrosService.addCobro(this.cobroForm.value).subscribe({
        next: () => {
          this.snackBar.open('Cobro registrado con éxito', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          this.snackBar.open('Error al registrar cobro', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
