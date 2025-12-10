import { Routes } from '@angular/router';
import { authGuard, managerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'approvals/new',
    loadComponent: () => import('./components/approval-form/approval-form.component').then(m => m.ApprovalFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'approvals/:id/edit',
    loadComponent: () => import('./components/approval-form/approval-form.component').then(m => m.ApprovalFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'approvals/:id',
    loadComponent: () => import('./components/approval-detail/approval-detail.component').then(m => m.ApprovalDetailComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
