import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types";
import { authKeys } from "./keys";
import Cookies from "js-cookie";

export const loginMutation = {
  mutationKey: authKeys.login(),
  mutationFn: async (
    credentials: LoginRequest,
  ): Promise<BaseResponse<LoginResponse>> => {
    const { data } = await api.post<BaseResponse<LoginResponse>>(
      ENDPOINTS.LOGIN,
      credentials,
    );

    if (!data) {
      throw new Error(data || "Login failed!");
    }

    return data;
  },
  onSuccess: (data: BaseResponse<LoginResponse>) => {
    if (data.data) {
      Cookies.set("token", data.data.accessToken);
    }
    toast.success(data.message || "Login successful!");
  },
  onError: (error: AxiosError<BaseResponse<LoginResponse>>) => {
    const message =
      error.response?.data?.message || error.message || "Login failed!";
    toast.error(message);
  },
};

export const logoutMutation = {
  mutationKey: authKeys.logout(),
  mutationFn: async (): Promise<BaseResponse> => {
    const { data } = await api.post<BaseResponse>(ENDPOINTS.LOGOUT);

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    Cookies.remove("token");
    toast.success(data.message || "Logout successful!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message || error.message || "Login failed!";
    toast.error(message);
  },
};

export const registerMutation = {
  mutationKey: authKeys.register(),
  mutationFn: async (data: RegisterRequest): Promise<BaseResponse> => {
    const { data: response } = await api.post<BaseResponse>(
      ENDPOINTS.REGISTER,
      data,
    );

    return response;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Registration successful!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message || error.message || "Registration failed!";
    toast.error(message);
  },
};

export const forgotPasswordMutation = {
  mutationKey: authKeys.forgotPassword(),
  mutationFn: async (data: ForgotPasswordRequest): Promise<BaseResponse> => {
    const { data: response } = await api.post<BaseResponse>(
      ENDPOINTS.FORGOT_PASSWORD,
      data,
    );

    return response;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Password reset email sent!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to send reset email!";
    toast.error(message);
  },
};

export const resetPasswordMutation = {
  mutationKey: authKeys.resetPassword(),
  mutationFn: async (data: ResetPasswordRequest): Promise<BaseResponse> => {
    const { data: response } = await api.post<BaseResponse>(
      ENDPOINTS.RESET_PASSWORD,
      data,
    );

    return response;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Password reset successful!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to reset password!";
    toast.error(message);
  },
};
