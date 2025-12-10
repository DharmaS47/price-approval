export interface Approval {
  id: number;
  user_id: number;
  product_name: string;
  current_price: number;
  proposed_price: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approval_date?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_email?: string;
  approver_name?: string;
  approver_email?: string;
}

export interface CreateApprovalRequest {
  product_name: string;
  current_price: number;
  proposed_price: number;
  justification: string;
}

export interface UpdateApprovalRequest {
  product_name?: string;
  current_price?: number;
  proposed_price?: number;
  justification?: string;
}

export interface ApprovalActionRequest {
  comments?: string;
}
