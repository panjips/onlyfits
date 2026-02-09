import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  PlanListFilter,
  PlanResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "../types";
import { planKeys } from "./plan-key";

// Query for fetching plan list with filters
export const planListQuery = (params?: PlanListFilter) => ({
  queryKey: planKeys.list(params),
  queryFn: async (): Promise<PlanResponse[]> => {
    const { data } = await api.get<BaseResponse<PlanResponse[]>>(
      ENDPOINTS.PLANS,
      { params }
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch plan list");
    }

    return data.data;
  },
});

// Query for fetching plans by organization
export const organizationPlanListQuery = (params?: PlanListFilter) => ({
  queryKey: planKeys.list(params),
  queryFn: async (): Promise<PlanResponse[]> => {
    const { data } = await api.get<BaseResponse<PlanResponse[]>>(
      ENDPOINTS.ORGANIZATION_PLANS.replace(":id", params?.organizationId || ""),
      { params }
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch plan list");
    }

    return data.data;
  },
});

// Query for fetching single plan detail
export const planDetailQuery = (id: string) => ({
  queryKey: planKeys.detail(id),
  queryFn: async (): Promise<PlanResponse> => {
    const { data } = await api.get<BaseResponse<PlanResponse>>(
      ENDPOINTS.PLAN_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as PlanResponse;
  },
  enabled: !!id,
});

// Mutation for creating plan
export const createPlanMutation = {
  mutationKey: planKeys.create(),
  mutationFn: async (
    request: CreatePlanRequest
  ): Promise<BaseResponse<PlanResponse>> => {
    const { data } = await api.post<BaseResponse<PlanResponse>>(
      ENDPOINTS.PLANS,
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<PlanResponse>) => {
    toast.success(data.message || "Plan created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<PlanResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create plan!";
    toast.error(message);
  },
};

// Mutation for updating plan
export const updatePlanMutation = (id: string) => ({
  mutationKey: planKeys.update(),
  mutationFn: async (
    request: UpdatePlanRequest
  ): Promise<BaseResponse<PlanResponse>> => {
    const { data } = await api.put<BaseResponse<PlanResponse>>(
      ENDPOINTS.PLAN_DETAIL.replace(":id", id),
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<PlanResponse>) => {
    toast.success(data.message || "Plan updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<PlanResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update plan!";
    toast.error(message);
  },
});

// Mutation for deleting plan
export const deletePlanMutation = {
  mutationKey: planKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.PLAN_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Plan deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete plan!";
    toast.error(message);
  },
};
