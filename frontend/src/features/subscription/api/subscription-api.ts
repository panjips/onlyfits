import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  SubscriptionListFilter,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  RenewSubscriptionRequest,
} from "../types";
import { subscriptionKeys } from "./subscription-key";

// Query for fetching subscription list with filters
export const subscriptionListQuery = (params?: SubscriptionListFilter) => ({
  queryKey: subscriptionKeys.list(params),
  queryFn: async (): Promise<SubscriptionResponse[]> => {
    const { data } = await api.get<BaseResponse<SubscriptionResponse[]>>(
      ENDPOINTS.SUBSCRIPTIONS,
      { params }
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch subscription list");
    }

    return data.data;
  },
});

// Query for fetching single subscription detail
export const subscriptionDetailQuery = (id: string) => ({
  queryKey: subscriptionKeys.detail(id),
  queryFn: async (): Promise<SubscriptionResponse> => {
    const { data } = await api.get<BaseResponse<SubscriptionResponse>>(
      ENDPOINTS.SUBSCRIPTION_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as SubscriptionResponse;
  },
  enabled: !!id,
});

// Query for fetching active subscription by member ID
export const activeSubscriptionQuery = (memberId: string) => ({
  queryKey: [...subscriptionKeys.all, "active", memberId] as const,
  queryFn: async (): Promise<SubscriptionResponse> => {
    const { data } = await api.get<BaseResponse<SubscriptionResponse>>(
      ENDPOINTS.SUBSCRIPTION_ACTIVE.replace(":memberId", memberId)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data as SubscriptionResponse;
  },
  enabled: !!memberId,
});

// Mutation for creating subscription
export const createSubscriptionMutation = {
  mutationKey: subscriptionKeys.create(),
  mutationFn: async (
    request: CreateSubscriptionRequest
  ): Promise<BaseResponse<SubscriptionResponse>> => {
    const { data } = await api.post<BaseResponse<SubscriptionResponse>>(
      ENDPOINTS.SUBSCRIPTIONS,
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<SubscriptionResponse>) => {
    toast.success(data.message || "Subscription created successfully!");
  },
  onError: (error: AxiosError<BaseResponse<SubscriptionResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create subscription!";
    toast.error(message);
  },
};

// Mutation for updating subscription
export const updateSubscriptionMutation = (id: string) => ({
  mutationKey: subscriptionKeys.update(),
  mutationFn: async (
    request: UpdateSubscriptionRequest
  ): Promise<BaseResponse<SubscriptionResponse>> => {
    const { data } = await api.put<BaseResponse<SubscriptionResponse>>(
      ENDPOINTS.SUBSCRIPTION_DETAIL.replace(":id", id),
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<SubscriptionResponse>) => {
    toast.success(data.message || "Subscription updated successfully!");
  },
  onError: (error: AxiosError<BaseResponse<SubscriptionResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update subscription!";
    toast.error(message);
  },
});

// Mutation for deleting subscription
export const deleteSubscriptionMutation = {
  mutationKey: subscriptionKeys.delete(),
  mutationFn: async (id: string): Promise<BaseResponse> => {
    const { data } = await api.delete<BaseResponse>(
      ENDPOINTS.SUBSCRIPTION_DETAIL.replace(":id", id)
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse) => {
    toast.success(data.message || "Subscription deleted successfully!");
  },
  onError: (error: AxiosError<BaseResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete subscription!";
    toast.error(message);
  },
};

// Mutation for renewing subscription
export const renewSubscriptionMutation = (memberId: string) => ({
  mutationKey: subscriptionKeys.renew(),
  mutationFn: async (
    request: RenewSubscriptionRequest
  ): Promise<BaseResponse<SubscriptionResponse>> => {
    const { data } = await api.post<BaseResponse<SubscriptionResponse>>(
      ENDPOINTS.SUBSCRIPTION_RENEW.replace(":memberId", memberId),
      request
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<SubscriptionResponse>) => {
    toast.success(data.message || "Subscription renewed successfully!");
  },
  onError: (error: AxiosError<BaseResponse<SubscriptionResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to renew subscription!";
    toast.error(message);
  },
});
