// Member Types based on BE DTO

export interface MemberResponse {
  id: string;
  userId?: string | null;
  organizationId: string;
  homeBranchId?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  status: string;
  joinDate?: string | null;
  notes?: string | null;
}

export interface MemberListFilter {
  organizationId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateMemberRequest {
  email?: string | null;
  userId?: string | null;
  organizationId: string;
  homeBranchId?: string | null;
  planId?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  status?: string | null;
  joinDate?: string | null;
  notes?: string | null;
}

export interface UpdateMemberRequest {
  userId?: string | null;
  homeBranchId?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  status?: string | null;
  joinDate?: string | null;
  notes?: string | null;
}
