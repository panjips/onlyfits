import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Battery, CalendarDays } from "lucide-react";
import { type BurnoutAnalysisData as BurnoutAnalysisType } from "../types";
import { useWellnessAnalytics } from "../hooks/use-wellness-analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface BurnoutAnalysisProps {
  data?: BurnoutAnalysisType;
  variant?: "default" | "compact";
}

export const BurnoutAnalysis = ({
  data: propData,
  variant = "default",
}: BurnoutAnalysisProps) => {
  const { data: apiData, isLoading } = useWellnessAnalytics();
  const data = propData || apiData?.burnout_analysis;
  const isCompact = variant === "compact";

  if (isLoading && !data) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
          <Skeleton className="h-20 w-full rounded-lg" />
          {!isCompact && (
            <>
              <div className="grid grid-cols-3 gap-2 mt-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-3 mt-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-20 w-full mt-6" />
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "outline";
      case "moderate":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Burnout Analysis</CardTitle>
          <Badge
            variant={getRiskBadgeVariant(data.risk_level)}
            className={`flex items-center gap-1.5 px-3 py-1 whitespace-nowrap ${
              data.risk_level.toLowerCase() === "high" ? "animate-pulse" : ""
            }`}
          >
            {data.risk_level} Risk
          </Badge>
        </div>
        <CardDescription>Training load and recovery insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        {/* Risk Score */}
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
          <div
            className={`text-4xl font-bold ${getRiskColor(data.risk_level)}`}
          >
            {data.risk_score}
          </div>
          <div>
            <div className="font-semibold">Burnout Risk Score</div>
            <div className="text-sm text-muted-foreground">
              Based on your recent training load and rest patterns.
            </div>
          </div>
        </div>

        {!isCompact && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-3 border rounded-lg text-center bg-card">
                <CalendarDays className="w-5 h-5 mb-2 text-primary" />
                <span className="text-2xl font-bold">
                  {data.key_metrics.avg_sessions_per_week}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Avg Sessions/Wk
                </span>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg text-center bg-card">
                <Activity className="w-5 h-5 mb-2 text-primary" />
                <span className="text-2xl font-bold">
                  {data.key_metrics.consecutive_training_days_max}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Max Consecutive
                </span>
              </div>
              <div className="flex flex-col items-center p-3 border rounded-lg text-center bg-card">
                <Battery className="w-5 h-5 mb-2 text-primary" />
                <span className="text-2xl font-bold">
                  {data.key_metrics.rest_days_last_30}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Rest Days
                </span>
              </div>
            </div>

            {/* Warning Signs */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Warning Signs
              </h4>
              <ul className="space-y-2">
                {data.warning_signs.map((sign: string, index: number) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recovery Suggestion */}
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <h4 className="text-sm font-semibold mb-1">
                Recovery Recommendation
              </h4>
              <p className="text-sm">{data.recovery_suggestion}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
