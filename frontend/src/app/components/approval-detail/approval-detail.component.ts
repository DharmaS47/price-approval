import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApprovalService } from '../../services/approval.service';
import { AuthService } from '../../services/auth.service';
import { Approval } from '../../models/approval.model';

@Component({
  selector: 'app-approval-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div *ngIf="loading" class="loading">Loading approval details...</div>
      
      <div *ngIf="!loading && approval" class="card">
        <h2 class="card-title">Price Approval Request #{{ approval.id }}</h2>
        
        <div class="detail-section">
          <h3>Product Information</h3>
          <p><strong>Product:</strong> {{ approval.product_name }}</p>
          <p><strong>Current Price:</strong> {{ approval.current_price | currency }}</p>
          <p><strong>Proposed Price:</strong> {{ approval.proposed_price | currency }}</p>
          <p><strong>Status:</strong> 
            <span class="badge" 
                  [class.badge-pending]="approval.status === 'pending'"
                  [class.badge-approved]="approval.status === 'approved'"
                  [class.badge-rejected]="approval.status === 'rejected'">
              {{ approval.status | uppercase }}
            </span>
          </p>
        </div>

        <div class="detail-section">
          <h3>Justification</h3>
          <p>{{ approval.justification }}</p>
        </div>

        <div *ngIf="approval.comments" class="detail-section">
          <h3>Comments</h3>
          <p>{{ approval.comments }}</p>
        </div>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>

        <div class="action-section">
          <button class="btn btn-secondary" (click)="goBack()">Back to Dashboard</button>
          
          <div class="action-buttons" *ngIf="approval.status === 'pending'">
            <button *ngIf="canEdit()" class="btn btn-primary" 
                    [routerLink]="['/approvals', approval.id, 'edit']">
              Edit
            </button>
            <button *ngIf="canEdit()" class="btn btn-danger" 
                    (click)="deleteApproval()" [disabled]="actionLoading">
              Delete
            </button>
            <button *ngIf="canApprove()" class="btn btn-success" 
                    (click)="approveApproval()" [disabled]="actionLoading">
              Approve
            </button>
            <button *ngIf="canApprove()" class="btn btn-danger" 
                    (click)="rejectApproval()" [disabled]="actionLoading">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { max-width: 800px; margin: 0 auto; }
    .detail-section { margin: 1.5rem 0; }
    .detail-section h3 { margin-bottom: 0.5rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; }
    .action-section { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid var(--border-color); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  `]
})
export class ApprovalDetailComponent implements OnInit {
  approval: Approval | null = null;
  loading = true;
  actionLoading = false;
  error = '';
  success = '';

  constructor(
    private approvalService: ApprovalService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApproval(+id);
    }
  }

  loadApproval(id: number): void {
    this.loading = true;
    this.approvalService.getById(id).subscribe({
      next: (response) => {
        this.approval = response.approval;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load approval details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  canEdit(): boolean {
    return this.approval?.user_id === this.authService.currentUser?.id;
  }

  canApprove(): boolean {
    return this.authService.isManager;
  }

  approveApproval(): void {
    if (!this.approval || !confirm('Are you sure you want to approve this request?')) return;
    
    this.actionLoading = true;
    this.error = '';
    this.success = '';

    const comments = prompt('Add comments (optional):');
    
    this.approvalService.approve(this.approval.id, comments || undefined).subscribe({
      next: () => {
        this.success = 'Request approved successfully!';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to approve request';
        this.actionLoading = false;
      }
    });
  }

  rejectApproval(): void {
    if (!this.approval) return;
    
    const comments = prompt('Please provide a reason for rejection (required):');
    if (!comments || comments.trim() === '') {
      alert('Comments are required when rejecting a request');
      return;
    }

    this.actionLoading = true;
    this.error = '';
    this.success = '';
    
    this.approvalService.reject(this.approval.id, comments).subscribe({
      next: () => {
        this.success = 'Request rejected';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to reject request';
        this.actionLoading = false;
      }
    });
  }

  deleteApproval(): void {
    if (!this.approval || !confirm('Are you sure you want to delete this request?')) return;
    
    this.actionLoading = true;
    this.error = '';
    
    this.approvalService.delete(this.approval.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to delete request';
        this.actionLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
