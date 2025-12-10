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
  template: ,
  styles: []
})
export class ApprovalDetailComponent implements OnInit {
  approval: Approval | null = null;
  loading = true;

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
        console.error(err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}