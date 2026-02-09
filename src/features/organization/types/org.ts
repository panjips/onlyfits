import type { ModuleResponse } from "./module";

export interface OrganizationConfig {
  [key: string]: unknown;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  logoUrl?: string | null;
  config?: OrganizationConfig;
  moduleIds?: string[];
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  config?: OrganizationConfig;
  moduleIds?: string[];
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  config: OrganizationConfig;
  modules?: ModuleResponse[]
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
}