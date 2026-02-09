import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  CreateOrganizationRequest,
  OrganizationListParams,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from "../types";
import { organizationKeys } from "./org-key";

// Query for fetching organization list
export const organizationListQuery = (params?: OrganizationListParams) => ({
  queryKey: organizationKeys.list(params),
  queryFn: async (): Promise<OrganizationResponse[]> => {
    const { data } = await api.get<BaseResponse<OrganizationResponse[]>>(
      ENDPOINTS.ORGANIZATIONS,
      { params },
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as OrganizationResponse[];
  },
});

// Query for fetching single organization detail
export const organizationDetailQuery = (id: string) => ({
  queryKey: organizationKeys.detail(id),
  queryFn: async (): Promise<OrganizationResponse> => {
    const { data } = await api.get<BaseResponse<OrganizationResponse>>(
      ENDPOINTS.ORGANIZATION_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as OrganizationResponse;
  },
  enabled: !!id,
});

// Mutation for creating organization
export const createOrganizationMutation = {
  mutationKey: organizationKeys.create(),
  mutationFn: async (
    request: CreateOrganizationRequest,
  ): Promise<BaseResponse<OrganizationResponse>> => {
    const { data } = await api.post<BaseResponse<OrganizationResponse>>(
      ENDPOINTS.ORGANIZATIONS,
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<OrganizationResponse>) => {
    toast.success(data.message || "Organization created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<OrganizationResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create organization!";
    toast.error(message);
  },
};

// Mutation for updating organization
export const updateOrganizationMutation = (id: string) => ({
  mutationKey: organizationKeys.update(),
  mutationFn: async (
    request: UpdateOrganizationRequest,
  ): Promise<BaseResponse<OrganizationResponse>> => {
    const { data } = await api.put<BaseResponse<OrganizationResponse>>(
      ENDPOINTS.ORGANIZATION_DETAIL.replace(":id", id),
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<OrganizationResponse>) => {
    toast.success(data.message || "Organization updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<OrganizationResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update organization!";
    toast.error(message);
  },
});

// Mutation for deleting organization
export const deleteOrganizationMutation = {
  mutationKey: organizationKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.ORGANIZATION_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Organization deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete organization!";
    toast.error(message);
  },
};
