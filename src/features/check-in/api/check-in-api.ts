import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import { checkInKeys } from "./check-in-key";

export interface ScannerRequest {
  token: string;
}

export interface ScannerResponse {
  message: string;
}

// Response from backend - CheckInWithMemberResponse DTO
export interface SessionActivityResponse {
  id: string;
  branch_id: string;
  member_id: string;
  subscription_id: string;
  check_in_time: string;
  check_out_time?: string | null;
  method?: string;
  member_name: string;
}

// Mutation for scanning member QR code
export const scannerMutation = {
  mutationKey: checkInKeys.scanner(),
  mutationFn: async (
    request: ScannerRequest,
  ): Promise<BaseResponse<ScannerResponse>> => {
    const { data } = await api.post<BaseResponse<ScannerResponse>>(
      ENDPOINTS.MEMBER_SCANNER,
      request,
    );

    if (!data.success) {
      throw new Error(data.message);
    }

    return data;
  },
  onSuccess: (data: BaseResponse<ScannerResponse>) => {
    toast.success(data.message || "Check-in successful!");
  },
  onError: (error: AxiosError<BaseResponse<ScannerResponse>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to process scan!";
    toast.error(message);
  },
};

// Query for fetching session activities by branch ID
export const sessionActivitiesQuery = (branchId: string) => ({
  queryKey: checkInKeys.sessionActivities(branchId),
  queryFn: async (): Promise<SessionActivityResponse[]> => {
    const endpoint = ENDPOINTS.MEMBER_SESSIONS.replace(":branchId", branchId);
    const { data } =
      await api.get<BaseResponse<SessionActivityResponse[]>>(endpoint);

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data ?? [];
  },
  enabled: !!branchId,
});
