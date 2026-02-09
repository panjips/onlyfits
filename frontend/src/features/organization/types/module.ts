export interface CreateModuleRequest {
key: string;
name: string;
  description?: string;
}

export interface UpdateModuleRequest {
  key?: string;
  name?: string;
  description?: string;
}

export interface ModuleResponse {
  id: string;
  key: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface ModuleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface OrganizationModuleConfig {
  [key: string]: unknown;
}

export interface OrganizationModule {
  organizationId: string;
  moduleId: string;
  isEnabled: boolean;
  config: OrganizationModuleConfig;
  enabledAt: string;
}
