import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserListParams,
  UserResponse,
  UserProfileResponse,
} from "../types";
import { userKeys } from "./user-key";

// Query for fetching user list with filters
export const userListQuery = (params?: UserListParams) => ({
  queryKey: userKeys.list(params),
  queryFn: async (): Promise<UserResponse[]> => {
    const { data } = await api.get<BaseResponse<UserResponse[]>>(
      ENDPOINTS.USERS,
      { params },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch user list");
    }

    return data.data;
  },
});

// Query for fetching single user detail
export const userDetailQuery = (id: string) => ({
  queryKey: userKeys.detail(id),
  queryFn: async (): Promise<UserProfileResponse> => {
    const { data } = await api.get<BaseResponse<UserProfileResponse>>(
      ENDPOINTS.USER_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as UserProfileResponse;
  },
  enabled: !!id,
});

// Query for fetching current user profile
export const userProfileQuery = () => ({
  queryKey: userKeys.profile(),
  queryFn: async (): Promise<UserProfileResponse> => {
    const { data } = await api.get<BaseResponse<UserProfileResponse>>(
      ENDPOINTS.PROFILE,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as UserProfileResponse;
  },
});

// Query for fetching user by email (for member creation)
export const userByEmailQuery = (email: string) => ({
  queryKey: [...userKeys.all, "byEmail", email] as const,
  queryFn: async (): Promise<UserProfileResponse | null> => {
    const { data } = await api.get<BaseResponse<UserProfileResponse>>(
      ENDPOINTS.USER_BY_EMAIL.replace(":email", encodeURIComponent(email)),
    );

    if (!data.success) {
      return null;
    }

    return data.data as UserProfileResponse;
  },
  enabled: !!email && email.includes("@"),
  retry: false,
});

// Mutation for creating user
export const createUserMutation = {
  mutationKey: userKeys.create(),
  mutationFn: async (
    request: CreateUserRequest,
  ): Promise<BaseResponse<UserResponse>> => {
    const { data } = await api.post<BaseResponse<UserResponse>>(
      ENDPOINTS.USERS,
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<UserResponse>) => {
    toast.success(data.message || "User created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<UserResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create user!";
    toast.error(message);
  },
};

// Mutation for updating user
export const updateUserMutation = (id: string) => ({
  mutationKey: userKeys.update(),
  mutationFn: async (
    request: UpdateUserRequest,
  ): Promise<BaseResponse<UserResponse>> => {
    const { data } = await api.put<BaseResponse<UserResponse>>(
      ENDPOINTS.USER_DETAIL.replace(":id", id),
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<UserResponse>) => {
    toast.success(data.message || "User updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<UserResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update user!";
    toast.error(message);
  },
});

export const deleteUserMutation = {
  mutationKey: userKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.USER_DETAIL.replace(":id", id),
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "User deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete user!";
    toast.error(message);
  },
};

// Mutation for changing password
export const changePasswordMutation = (id: string) => ({
  mutationKey: [...userKeys.all, "changePassword"] as const,
  mutationFn: async (request: ChangePasswordRequest): Promise<BaseResponse> => {
    const { data } = await api.put<BaseResponse>(
      ENDPOINTS.USER_CHANGE_PASSWORD.replace(":id", id),
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Password changed successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to change password!";
    toast.error(message);
  },
});
