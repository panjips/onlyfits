import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  MemberListFilter,
  MemberResponse,
  CreateMemberRequest,
  UpdateMemberRequest,
} from "../types";
import { memberKeys } from "./member-key";

// Query for fetching member list with filters
export const memberListQuery = (params?: MemberListFilter) => ({
  queryKey: memberKeys.list(params),
  queryFn: async (): Promise<MemberResponse[]> => {
    const { data } = await api.get<BaseResponse<MemberResponse[]>>(
      ENDPOINTS.MEMBERS,
      { params }
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch member list");
    }

    return data.data;
  },
});

// Query for fetching single member detail
export const memberDetailQuery = (id: string) => ({
  queryKey: memberKeys.detail(id),
  queryFn: async (): Promise<MemberResponse> => {
    const { data } = await api.get<BaseResponse<MemberResponse>>(
      ENDPOINTS.MEMBER_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as MemberResponse;
  },
  enabled: !!id,
});

// Mutation for creating member
export const createMemberMutation = {
  mutationKey: memberKeys.create(),
  mutationFn: async (
    request: CreateMemberRequest
  ): Promise<BaseResponse<MemberResponse>> => {
    const { data } = await api.post<BaseResponse<MemberResponse>>(
      ENDPOINTS.MEMBERS,
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<MemberResponse>) => {
    toast.success(data.message || "Member created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<MemberResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create member!";
    toast.error(message);
  },
};

// Mutation for updating member
export const updateMemberMutation = (id: string) => ({
  mutationKey: memberKeys.update(),
  mutationFn: async (
    request: UpdateMemberRequest
  ): Promise<BaseResponse<MemberResponse>> => {
    const { data } = await api.put<BaseResponse<MemberResponse>>(
      ENDPOINTS.MEMBER_DETAIL.replace(":id", id),
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<MemberResponse>) => {
    toast.success(data.message || "Member updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<MemberResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update member!";
    toast.error(message);
  },
});

// Mutation for deleting member
export const deleteMemberMutation = {
  mutationKey: memberKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.MEMBER_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Member deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete member!";
    toast.error(message);
  },
};
