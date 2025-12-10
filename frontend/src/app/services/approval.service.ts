import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Approval, 
  CreateApprovalRequest, 
  UpdateApprovalRequest,
  ApprovalActionRequest 
} from '../models/approval.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private apiUrl = `${environment.apiUrl}/approvals`;

  constructor(private http: HttpClient) {}

  getAll(status?: string): Observable<{ approvals: Approval[] }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<{ approvals: Approval[] }>(this.apiUrl, { params });
  }

  getById(id: number): Observable<{ approval: Approval }> {
    return this.http.get<{ approval: Approval }>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateApprovalRequest): Observable<{ message: string; approval: Approval }> {
    return this.http.post<{ message: string; approval: Approval }>(this.apiUrl, data);
  }

  update(id: number, data: UpdateApprovalRequest): Observable<{ message: string; approval: Approval }> {
    return this.http.put<{ message: string; approval: Approval }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  approve(id: number, comments?: string): Observable<{ message: string; approval: Approval }> {
    const data: ApprovalActionRequest = { comments };
    return this.http.post<{ message: string; approval: Approval }>(`${this.apiUrl}/${id}/approve`, data);
  }

  reject(id: number, comments: string): Observable<{ message: string; approval: Approval }> {
    const data: ApprovalActionRequest = { comments };
    return this.http.post<{ message: string; approval: Approval }>(`${this.apiUrl}/${id}/reject`, data);
  }
}
