// Plan Types based on BE DTO

export interface PlanResponse {
  id: string;
  organizationId: string;
  branchIds?: string[] | null;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  isActive?: boolean | null;
}

export interface PlanListFilter {
  organizationId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface CreatePlanRequest {
  organizationId: string;
  branchIds?: string[] | null;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
}

export interface UpdatePlanRequest {
  branchIds?: string[] | null;
  name?: string;
  description?: string | null;
  price?: number | null;
  durationDays?: number | null;
  isActive?: boolean | null;
}
