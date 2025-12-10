import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="app">
      <nav class="navbar" *ngIf="authService.isAuthenticated">
        <div class="container">
          <div class="navbar-content">
            <div class="navbar-brand">
              <h2>💰 Price Approval</h2>
            </div>
            <div class="navbar-menu">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
              <a routerLink="/approvals/new" class="nav-link">New Request</a>
              <div class="navbar-user">
                <span class="user-name">{{ authService.currentUser?.name }}</span>
                <span class="user-role badge" 
                      [class.badge-admin]="authService.isAdmin"
                      [class.badge-manager]="authService.isManager && !authService.isAdmin">
                  {{ authService.currentUser?.role }}
                </span>
                <button class="btn btn-secondary btn-sm" (click)="logout()">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem 0;
      margin-bottom: 2rem;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand h2 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.5rem;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background-color: var(--light-bg);
    }

    .nav-link.active {
      color: var(--primary-color);
      background-color: #dbeafe;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: 1rem;
      padding-left: 1rem;
      border-left: 2px solid var(--border-color);
    }

    .user-name {
      font-weight: 500;
    }

    .badge-admin {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .badge-manager {
      background-color: #ddd6fe;
      color: #5b21b6;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .main-content {
      min-height: calc(100vh - 100px);
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
