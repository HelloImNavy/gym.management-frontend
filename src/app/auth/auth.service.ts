import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { LoginCredentials, AuthResponse } from '../auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authSubject.asObservable();

  // Usuario de prueba
  private readonly MOCK_USER = {
    username: 'admin',
    password: 'admin123'
  };

  constructor() {
    this.checkToken();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    if (credentials.username === this.MOCK_USER.username && 
        credentials.password === this.MOCK_USER.password) {
      const response: AuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: this.MOCK_USER.username,
          role: 'ADMIN'
        }
      };
      localStorage.setItem('token', response.token);
      this.authSubject.next(true);
      return of(response);
    }
    return throwError(() => new Error('Usuario o contraseña incorrectos'));
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authSubject.next(false);
  }

  private checkToken(): void {
    const token = localStorage.getItem('token');
    this.authSubject.next(!!token);
  }
}