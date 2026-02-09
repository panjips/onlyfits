import { useQuery } from "@tanstack/react-query";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Loader2 } from "lucide-react";
import { useUser } from "@/provider/user-provider";
import { visitorCountQuery } from "../api";

export const description = "Current gym occupancy indicator";

const MAX_CAPACITY = 100;

const getOccupancyStatus = (current: number, max: number) => {
  const percentage = (current / max) * 100;

  if (percentage >= 80) {
    return {
      label: "Very Busy",
      color: "text-error",
      bgColor: "bg-lighterror",
      fillColor: "var(--color-error)",
      endAngle: Math.min(percentage * 2.7, 270),
    };
  } else if (percentage >= 50) {
    return {
      label: "Moderate",
      color: "text-warning",
      bgColor: "bg-lightwarning",
      fillColor: "var(--color-warning)",
      endAngle: percentage * 2.7,
    };
  } else if (percentage >= 25) {
    return {
      label: "Comfortable",
      color: "text-primary",
      bgColor: "bg-lightprimary",
      fillColor: "var(--color-primary)",
      endAngle: percentage * 2.7,
    };
  } else {
    return {
      label: "Quiet",
      color: "text-success",
      bgColor: "bg-lightsuccess",
      fillColor: "var(--color-success)",
      endAngle: Math.max(percentage * 2.7, 15), // Minimum angle for visibility
    };
  }
};

export const GymOccupancyChart = () => {
  const { user } = useUser();
  const branchId = user?.branchId ?? "";

  const { data, isLoading, isError } = useQuery({
    ...visitorCountQuery(branchId),
    refetchInterval: 30000 * 4,
  });

  const currentCheckins = data?.count ?? 0;
  const status = getOccupancyStatus(currentCheckins, MAX_CAPACITY);
  const occupancyPercentage = Math.round(
    (currentCheckins / MAX_CAPACITY) * 100,
  );

  const chartData = [
    { name: "checkins", value: currentCheckins, fill: status.fillColor },
  ];

  const chartConfig = {
    value: {
      label: "Check-ins",
    },
    checkins: {
      label: "Current",
      color: status.fillColor,
    },
  } satisfies ChartConfig;

  if (!branchId) {
    return (
      <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
          <h3 className="text-sm font-semibold text-foreground">
            Gym Occupancy
          </h3>
        </div>
        <div className="p-3 flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No branch assigned</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
          <h3 className="text-sm font-semibold text-foreground">
            Gym Occupancy
          </h3>
        </div>
        <div className="p-3 flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
          <h3 className="text-sm font-semibold text-foreground">
            Gym Occupancy
          </h3>
        </div>
        <div className="p-3 flex-1 flex items-center justify-center">
          <p className="text-sm text-error">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
        <h3 className="text-sm font-semibold text-foreground">Gym Occupancy</h3>
        <Badge className={`${status.bgColor} ${status.color} border-0 text-xs`}>
          <Activity className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
          <RadialBarChart
            data={chartData}
            startAngle={225}
            endAngle={225 - status.endAngle}
            innerRadius={45}
            outerRadius={70}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-muted/50"
              polarRadius={[50, 42]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 4}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {currentCheckins}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 12}
                          className="fill-muted-foreground text-[10px]"
                        >
                          checked in
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        {/* Footer */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{occupancyPercentage}% capacity</span>
        </div>
      </div>
    </div>
  );
};

export const VisitorChart = GymOccupancyChart;
