import { useQuery } from "@tanstack/react-query";
import { attendanceQuery } from "../api/api";

interface UseAttendanceParams {
  startDate: string;
  endDate: string;
}

export const useAttendance = ({ startDate, endDate }: UseAttendanceParams) => {
  return useQuery(attendanceQuery(startDate, endDate));
};
