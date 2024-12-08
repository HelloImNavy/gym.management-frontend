import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule
  ],
  template: `
    <mat-toolbar style="background-color: #4f082d; color: white; display: flex; justify-content: space-between; align-items: center;">
      <span class="titulo">ADMINISTRACIÓN GIMNASIO</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>user</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard/miembros" routerLinkActive="active">
          <i matListItemIcon class="material-icons">emoji_people</i>
            <span matListItemTitle class="letras">SOCIOS</span>
          </a>
          <a mat-list-item routerLink="/dashboard/actividades" routerLinkActive="active">
            <mat-icon matListItemIcon>fitness_center</mat-icon>
            <span matListItemTitle class="letras">ACTIVIDADES</span>
          </a>
          <a mat-list-item routerLink="/dashboard/cobros" routerLinkActive="active">
            <mat-icon matListItemIcon>payments</mat-icon>
            <span matListItemTitle class="letras">COBROS</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    span.titulo {
      flex: 1; 
      text-align: center; 
      font-size: 27px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    mat-sidenav-container {
      height: calc(100% - 64px);
    }
    mat-sidenav {
      width: 250px;
      background-color: #671a3b;
    }
    .letras {
      color: #ffffff;
    }
    .content {
      padding: 20px;
    }
    .active {
      background-color: rgba(0, 0, 0, 0.17);
    }
    
  `]
})
export class DashboardComponent {
  constructor(private authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }
}