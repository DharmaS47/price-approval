import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApprovalService } from '../../services/approval.service';
import { AuthService } from '../../services/auth.service';
import { Approval } from '../../models/approval.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="dashboard-header">
        <h1>Price Approval Dashboard</h1>
        <a routerLink="/approvals/new" class="btn btn-primary">+ New Request</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Requests</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value" style="color: var(--warning-color)">{{ stats.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value" style="color: var(--success-color)">{{ stats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card card">
          <div class="stat-value" style="color: var(--danger-color)">{{ stats.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>

      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          [class.active]="currentFilter === 'all'"
          (click)="filterApprovals('all')"
        >
          All
        </button>
        <button 
          class="filter-tab" 
          [class.active]="currentFilter === 'pending'"
          (click)="filterApprovals('pending')"
        >
          Pending
        </button>
        <button 
          class="filter-tab" 
          [class.active]="currentFilter === 'approved'"
          (click)="filterApprovals('approved')"
        >
          Approved
        </button>
        <button 
          class="filter-tab" 
          [class.active]="currentFilter === 'rejected'"
          (click)="filterApprovals('rejected')"
        >
          Rejected
        </button>
      </div>

      <div class="card">
        <div *ngIf="loading" class="loading">Loading approvals...</div>
        
        <div *ngIf="!loading && approvals.length === 0" class="empty-state">
          <p>No approval requests found</p>
          <a routerLink="/approvals/new" class="btn btn-primary">Create Your First Request</a>
        </div>

        <table *ngIf="!loading && approvals.length > 0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Price</th>
              <th>Proposed Price</th>
              <th>Change</th>
              <th *ngIf="authService.isManager">Requester</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let approval of approvals">
              <td>{{ approval.product_name }}</td>
              <td>{{ approval.current_price | currency }}</td>
              <td>{{ approval.proposed_price | currency }}</td>
              <td [class.price-increase]="approval.proposed_price > approval.current_price"
                  [class.price-decrease]="approval.proposed_price < approval.current_price">
                {{ getPriceChange(approval) }}
              </td>
              <td *ngIf="authService.isManager">{{ approval.requester_name }}</td>
              <td>
                <span class="badge" 
                      [class.badge-pending]="approval.status === 'pending'"
                      [class.badge-approved]="approval.status === 'approved'"
                      [class.badge-rejected]="approval.status === 'rejected'">
                  {{ approval.status }}
                </span>
              </td>
              <td>{{ approval.created_at | date:'short' }}</td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/approvals', approval.id]" class="btn btn-sm btn-secondary">View</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      text-align: center;
      padding: 1.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stat-label {
      color: var(--text-secondary);
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--border-color);
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
    }

    .filter-tab:hover {
      color: var(--primary-color);
    }

    .filter-tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .empty-state p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .price-increase {
      color: var(--danger-color);
      font-weight: 500;
    }

    .price-decrease {
      color: var(--success-color);
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  approvals: Approval[] = [];
  loading = true;
  currentFilter: string | null = 'all';
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  constructor(
    private approvalService: ApprovalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApprovals();
  }

  loadApprovals(status?: string): void {
    this.loading = true;
    this.approvalService.getAll(status).subscribe({
      next: (response) => {
        this.approvals = response.approvals;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load approvals:', err);
        this.loading = false;
      }
    });
  }

  filterApprovals(filter: string): void {
    this.currentFilter = filter;
    if (filter === 'all') {
      this.loadApprovals();
    } else {
      this.loadApprovals(filter);
    }
  }

  calculateStats(): void {
    if (this.currentFilter === 'all') {
      this.stats.total = this.approvals.length;
      this.stats.pending = this.approvals.filter(a => a.status === 'pending').length;
      this.stats.approved = this.approvals.filter(a => a.status === 'approved').length;
      this.stats.rejected = this.approvals.filter(a => a.status === 'rejected').length;
    }
  }

  getPriceChange(approval: Approval): string {
    const diff = approval.proposed_price - approval.current_price;
    const percent = (diff / approval.current_price) * 100;
    return `${diff >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  }
}
