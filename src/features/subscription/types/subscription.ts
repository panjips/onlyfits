// Subscription Types based on BE DTO

export interface SubscriptionResponse {
  id: string;
  memberId: string;
  planId?: string | null;
  branchId?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionListFilter {
  organizationId?: string;
  branchId?: string;
  memberId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSubscriptionRequest {
  memberId: string;
  planId?: string | null;
  branchId?: string | null;
  startDate: string;
  endDate: string;
  status?: string | null;
}

export interface UpdateSubscriptionRequest {
  planId?: string | null;
  branchId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
}

export interface RenewSubscriptionRequest {
  planId?: string | null;
  branchId?: string | null;
}
