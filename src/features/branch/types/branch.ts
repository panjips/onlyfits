export interface CreateBranchRequest {
  organizationId: string;
  name: string;
  code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  isActive?: boolean;
}

export interface BranchResponse {
  id: string;
  organizationId: string;
  name: string;
  code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  isActive?: boolean;
  updatedAt?: string;
}

export interface BranchListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
}
