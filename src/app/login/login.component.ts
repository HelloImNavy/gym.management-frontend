import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <h1 class="title">GIMNASIO ATHOS</h1>
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" required>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="!loginForm.valid">
              Iniciar Sesión
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

  `,
  styles: [`
    
    .login-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #671a3b; 
    }

    .title {
      color: #ffffff; 
      font-size: 54px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    mat-card-header {
      margin-bottom: 20px;
    }
    
    .credentials-info {
      background-color: #e3f2fd;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .credentials-info p {
      margin: 5px 0;
      font-size: 14px;
    }


  `]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}