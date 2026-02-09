import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  BranchListParams,
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../types";
import { branchKeys } from "./branch-key";

// Query for fetching branch list
export const branchListQuery = (params?: BranchListParams) => ({
  queryKey: branchKeys.list(params),
  queryFn: async (): Promise<BranchResponse[]> => {
    const { data } = await api.get<BaseResponse<BranchResponse[]>>(
      ENDPOINTS.BRANCHES,
      { params },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch branch list");
    }

    return data.data;
  },
});

export const organizationBranchListQuery = (params?: BranchListParams) => ({
  queryKey: branchKeys.list(params),
  queryFn: async (): Promise<BranchResponse[]> => {
    const { data } = await api.get<BaseResponse<BranchResponse[]>>(
      ENDPOINTS.ORGANIZATION_BRANCHES.replace(":id", params?.organizationId || ""),
      { params },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch branch list");
    }

    return data.data;
  },
});

// Query for fetching single branch detail
export const branchDetailQuery = (id: string) => ({
  queryKey: branchKeys.detail(id),
  queryFn: async (): Promise<BranchResponse> => {
    const { data } = await api.get<BaseResponse<BranchResponse>>(
      ENDPOINTS.BRANCH_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as BranchResponse;
  },
  enabled: !!id,
});

// Mutation for creating branch
export const createBranchMutation = {
  mutationKey: branchKeys.create(),
  mutationFn: async (
    request: CreateBranchRequest,
  ): Promise<BaseResponse<BranchResponse>> => {
    const { data } = await api.post<BaseResponse<BranchResponse>>(
      ENDPOINTS.BRANCHES,
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<BranchResponse>) => {
    toast.success(data.message || "Branch created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<BranchResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create branch!";
    toast.error(message);
  },
};

// Mutation for updating branch
export const updateBranchMutation = (id: string) => ({
  mutationKey: branchKeys.update(),
  mutationFn: async (
    request: UpdateBranchRequest,
  ): Promise<BaseResponse<BranchResponse>> => {
    const { data } = await api.put<BaseResponse<BranchResponse>>(
      ENDPOINTS.BRANCH_DETAIL.replace(":id", id),
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<BranchResponse>) => {
    toast.success(data.message || "Branch updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<BranchResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update branch!";
    toast.error(message);
  },
});

// Mutation for deleting branch
export const deleteBranchMutation = {
  mutationKey: branchKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.BRANCH_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Branch deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete branch!";
    toast.error(message);
  },
};
