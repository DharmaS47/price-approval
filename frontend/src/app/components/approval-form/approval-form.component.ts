import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApprovalService } from '../../services/approval.service';
import { Approval } from '../../models/approval.model';

@Component({
  selector: 'app-approval-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="form-container">
        <div class="card">
          <h2 class="card-title">{{ isEditMode ? 'Edit' : 'New' }} Price Approval Request</h2>
          
          <div *ngIf="error" class="alert alert-error">
            {{ error }}
          </div>

          <form [formGroup]="approvalForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="product_name">Product Name *</label>
              <input 
                type="text" 
                id="product_name"
                formControlName="product_name"
                placeholder="Enter product name"
              />
              <div *ngIf="approvalForm.get('product_name')?.invalid && approvalForm.get('product_name')?.touched" class="error-message">
                Product name is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="current_price">Current Price *</label>
                <input 
                  type="number" 
                  id="current_price"
                  formControlName="current_price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div *ngIf="approvalForm.get('current_price')?.invalid && approvalForm.get('current_price')?.touched" class="error-message">
                  Valid price required
                </div>
              </div>

              <div class="form-group">
                <label for="proposed_price">Proposed Price *</label>
                <input 
                  type="number" 
                  id="proposed_price"
                  formControlName="proposed_price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div *ngIf="approvalForm.get('proposed_price')?.invalid && approvalForm.get('proposed_price')?.touched" class="error-message">
                  Valid price required
                </div>
              </div>
            </div>

            <div *ngIf="approvalForm.get('current_price')?.value && approvalForm.get('proposed_price')?.value" class="price-change-info">
              <p>Price Change: <strong [class.increase]="priceChange > 0" [class.decrease]="priceChange < 0">
                {{ priceChange > 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
              </strong></p>
            </div>

            <div class="form-group">
              <label for="justification">Justification *</label>
              <textarea 
                id="justification"
                formControlName="justification"
                placeholder="Explain the reason for this price change..."
                rows="5"
              ></textarea>
              <div *ngIf="approvalForm.get('justification')?.invalid && approvalForm.get('justification')?.touched" class="error-message">
                Justification is required
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="goBack()"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="approvalForm.invalid || loading"
              >
                {{ loading ? 'Saving...' : (isEditMode ? 'Update Request' : 'Submit Request') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .error-message {
      color: var(--danger-color);
      font-size: 12px;
      margin-top: 4px;
    }

    .price-change-info {
      background: var(--light-bg);
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .price-change-info p {
      margin: 0;
      font-size: 1.1rem;
    }

    .price-change-info .increase {
      color: var(--danger-color);
    }

    .price-change-info .decrease {
      color: var(--success-color);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }
  `]
})
export class ApprovalFormComponent implements OnInit {
  approvalForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  approvalId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private approvalService: ApprovalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.approvalForm = this.fb.group({
      product_name: ['', Validators.required],
      current_price: [null, [Validators.required, Validators.min(0)]],
      proposed_price: [null, [Validators.required, Validators.min(0)]],
      justification: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.approvalId = +id;
      this.loadApproval();
    }
  }

  loadApproval(): void {
    if (!this.approvalId) return;
    
    this.approvalService.getById(this.approvalId).subscribe({
      next: (response) => {
        const approval = response.approval;
        if (approval.status !== 'pending') {
          this.error = 'Only pending approvals can be edited';
          setTimeout(() => this.goBack(), 2000);
          return;
        }
        this.approvalForm.patchValue({
          product_name: approval.product_name,
          current_price: approval.current_price,
          proposed_price: approval.proposed_price,
          justification: approval.justification
        });
      },
      error: (err) => {
        this.error = 'Failed to load approval';
        console.error(err);
      }
    });
  }

  get priceChange(): number {
    const current = this.approvalForm.get('current_price')?.value;
    const proposed = this.approvalForm.get('proposed_price')?.value;
    if (!current || !proposed) return 0;
    return ((proposed - current) / current) * 100;
  }

  onSubmit(): void {
    if (this.approvalForm.invalid) return;

    this.loading = true;
    this.error = '';

    const request = this.isEditMode 
      ? this.approvalService.update(this.approvalId!, this.approvalForm.value)
      : this.approvalService.create(this.approvalForm.value);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Operation failed. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
