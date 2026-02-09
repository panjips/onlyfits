import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { CalendarCheck, Clock, Loader2 } from "lucide-react";
import type { AttendanceData, DateRangeFilter } from "../types";
import { getFilterRange } from "../utils";
import { useAttendance } from "../hooks";

export const description = "An attendance tracking bar chart";

const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_14_days", label: "Last 14 Days" },
  { value: "month_to_date", label: "Month to Date" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_3_months", label: "Last 3 Months" },
];

const chartConfig = {
  duration: {
    label: "Duration",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export const AttendanceChart = () => {
  const [dateFilter, setDateFilter] =
    useState<DateRangeFilter>("month_to_date");

  const filterRange = useMemo(() => getFilterRange(dateFilter), [dateFilter]);

  const { data: attendanceData, isLoading } = useAttendance({
    startDate: filterRange.startDate,
    endDate: filterRange.endDate,
  });

  const chartData = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.map((item: AttendanceData) => ({
      date: item.date,
      duration: item.duration,
      isAttendance: item.isAttendance,
    }));
  }, [attendanceData]);

  const stats = useMemo(() => {
    if (!attendanceData) {
      return { totalAttendance: 0, avgTime: 0 };
    }

    const attendedDays = attendanceData.filter(
      (d: AttendanceData) => d.isAttendance,
    );
    const totalAttendance = attendedDays.length;
    const totalTime = attendedDays.reduce(
      (acc: number, curr: AttendanceData) => acc + curr.duration,
      0,
    );
    const avgTime =
      totalAttendance > 0 ? Math.round(totalTime / totalAttendance) : 0;

    return {
      totalAttendance,
      avgTime,
    };
  }, [attendanceData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border border-ld rounded-lg overflow-hidden">
          <div className="flex items-center justify-center px-6 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-ld rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-ld">
          <h3 className="text-base font-semibold text-foreground">
            Attendance Overview
          </h3>
          <Select
            value={dateFilter}
            onValueChange={(value: DateRangeFilter) => setDateFilter(value)}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6 bg-lightprimary dark:bg-darkprimary">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <CalendarCheck className="w-4 h-4" />
              <span>Total Attendance</span>
            </div>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {stats.totalAttendance}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                days
              </span>
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6 border-l border-ld">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="w-4 h-4" />
              <span>Average Time</span>
            </div>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {stats.avgTime}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                min
              </span>
            </span>
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}m`}
            domain={[0, 60]}
            ticks={[0, 15, 30, 45, 60]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-40"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value) => {
                  const numValue = Number(value);
                  if (numValue === 0) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span className="text-muted-foreground">
                          Not attended
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>{numValue} min session</span>
                    </div>
                  );
                }}
              />
            }
          />
          <Bar
            dataKey="duration"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
