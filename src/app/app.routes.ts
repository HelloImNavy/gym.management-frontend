import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MiembroListaComponent } from './miembros-lista/miembros-lista.component';
import { MiembrosFormComponent } from './miembros-form/miembros-form.component';
import { authGuard } from './auth/auth.guard';
// import { InscripcionesComponent } from './cobros-list/cobros-list.component';
import { ActividadFormComponent } from './actividades/actividad-form.component';
import { CobrosListComponent } from './cobros-list/cobros-list.component';
import { ActividadesListComponent } from './actividades/actividades-list.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'miembros', pathMatch: 'full' },
      { path: 'miembros', component: MiembroListaComponent },
      { path: 'miembros/nuevo', component: MiembrosFormComponent },
      { path: 'miembros/:id', component: MiembrosFormComponent },
      { path: 'cobros', component: CobrosListComponent}, 
      { path: 'actividades/nueva', component: ActividadFormComponent },
      { path: 'actividades/:id/editar', component: ActividadFormComponent },
      { path: 'actividades', component: ActividadesListComponent },

    ]
  }
];