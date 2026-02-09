import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  AttendanceData,
  ProfileResponse,
  QRCodeResponse,
  VisitorCountResponse,
  WellnessAnalysisResponse,
} from "../types";
import { dashboardKeys } from "./keys";

export const profileQuery = {
  queryKey: dashboardKeys.profile(),
  queryFn: async (): Promise<ProfileResponse> => {
    const { data } = await api.get<BaseResponse<ProfileResponse>>(
      ENDPOINTS.PROFILE,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message);
    }

    return data.data;
  },
};

export const memberQrQuery = {
  queryKey: dashboardKeys.qr(),
  queryFn: async (): Promise<QRCodeResponse> => {
    const { data } = await api.get<BaseResponse<QRCodeResponse>>(
      ENDPOINTS.MEMBER_QR,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch QR code");
    }

    return data.data;
  },
};

export const visitorCountQuery = (branchId: string) => ({
  queryKey: dashboardKeys.visitorCount(branchId),
  queryFn: async (): Promise<VisitorCountResponse> => {
    const endpoint = ENDPOINTS.MEMBER_VISITORS.replace(":branchId", branchId);
    const { data } =
      await api.get<BaseResponse<VisitorCountResponse>>(endpoint);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch visitor count");
    }

    return data.data;
  },
  enabled: !!branchId,
});

export const attendanceQuery = (startDate: string, endDate: string) => ({
  queryKey: dashboardKeys.attendance(startDate, endDate),
  queryFn: async (): Promise<AttendanceData[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    const { data } = await api.get<BaseResponse<AttendanceData[]>>(
      `${ENDPOINTS.MEMBER_ATTENDANCE}?${params.toString()}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch attendance data");
    }

    return data.data;
  },
  enabled: !!startDate && !!endDate,
});

export const wellnessAnalyticsQuery = () => ({
  queryKey: dashboardKeys.analytics(),
  queryFn: async (): Promise<WellnessAnalysisResponse> => {
    const { data } = await api.get<BaseResponse<WellnessAnalysisResponse>>(
      ENDPOINTS.MEMBER_ANALYTICS,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch wellness analytics");
    }

    return data.data;
  },
  staleTime: Infinity,
});
