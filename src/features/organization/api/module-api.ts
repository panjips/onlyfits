import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  CreateModuleRequest,
  ModuleListParams,
  ModuleResponse,
  UpdateModuleRequest,
} from "../types/module";
import { moduleKeys } from "./module-key";

// Query for fetching module list
export const moduleListQuery = (params?: ModuleListParams) => ({
  queryKey: moduleKeys.list(params),
  queryFn: async (): Promise<ModuleResponse[]> => {
    const { data } = await api.get<BaseResponse<ModuleResponse[]>>(
      ENDPOINTS.MODULES,
      { params },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch module list");
    }

    return data.data;
  },
});

// Query for fetching single module detail
export const moduleDetailQuery = (id: string) => ({
  queryKey: moduleKeys.detail(id),
  queryFn: async (): Promise<ModuleResponse> => {
    const { data } = await api.get<BaseResponse<ModuleResponse>>(
      ENDPOINTS.MODULE_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as ModuleResponse;
  },
  enabled: !!id,
});

// Mutation for creating module
export const createModuleMutation = {
  mutationKey: moduleKeys.create(),
  mutationFn: async (
    request: CreateModuleRequest,
  ): Promise<BaseResponse<ModuleResponse>> => {
    const { data } = await api.post<BaseResponse<ModuleResponse>>(
      ENDPOINTS.MODULES,
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<ModuleResponse>) => {
    toast.success(data.message || "Module created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<ModuleResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create module!";
    toast.error(message);
  },
};

// Mutation for updating module
export const updateModuleMutation = (id: string) => ({
  mutationKey: moduleKeys.update(),
  mutationFn: async (
    request: UpdateModuleRequest,
  ): Promise<BaseResponse<ModuleResponse>> => {
    const { data } = await api.put<BaseResponse<ModuleResponse>>(
      ENDPOINTS.MODULE_DETAIL.replace(":id", id),
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<ModuleResponse>) => {
    toast.success(data.message || "Module updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<ModuleResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update module!";
    toast.error(message);
  },
});

// Mutation for deleting module
export const deleteModuleMutation = {
  mutationKey: moduleKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.MODULE_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Module deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete module!";
    toast.error(message);
  },
};
