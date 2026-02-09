import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type BurnoutAnalysisData } from "../types";
import { useWellnessAnalytics } from "../hooks/use-wellness-analytics";
import {
  AlertTriangle,
  Activity,
  CalendarDays,
  Flame,
  ThermometerSun,
  Leaf,
  Zap,
  Moon,
  Timer,
  TrendingDown,
} from "lucide-react";

interface DetailBurnoutAnalysisProps {
  data?: BurnoutAnalysisData;
}

export const DetailBurnoutAnalysis = ({
  data: propData,
}: DetailBurnoutAnalysisProps) => {
  const { data: apiData, isLoading } = useWellnessAnalytics();
  const data = propData || apiData?.burnout_analysis;

  const getRiskColorScheme = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return {
          bgStyle:
            "bg-success/10 border-success/20 dark:bg-success/20 dark:border-success/30",
          text: "text-success",
          icon: Leaf,
          label: "Low Risk",
          description: "Your training load is well balanced",
        };
      case "moderate":
        return {
          bgStyle:
            "bg-warning/10 border-warning/20 dark:bg-warning/20 dark:border-warning/30",
          text: "text-warning",
          icon: ThermometerSun,
          label: "Moderate Risk",
          description: "Consider adding more recovery time",
        };
      case "high":
        return {
          bgStyle:
            "bg-error/10 border-error/20 dark:bg-error/20 dark:border-error/30",
          text: "text-error",
          icon: Flame,
          label: "High Risk",
          description: "Immediate rest is recommended",
        };
      default:
        return {
          bgStyle: "bg-muted border-border",
          text: "text-muted-foreground",
          icon: Activity,
          label: "Unknown",
          description: "Unable to assess risk level",
        };
    }
  };

  const getRiskBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-lightsuccess text-success border-success/20";
      case "moderate":
        return "bg-lightwarning text-warning border-warning/20";
      case "high":
        return "bg-lighterror text-error border-error/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading && !data) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const colorScheme = getRiskColorScheme(data.risk_level);
  const RiskIcon = colorScheme.icon;

  const scorePercentage = Math.min(100, data.risk_score);

  return (
    <Card className="overflow-hidden shadow-md bg-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 justify-between w-full">
          <CardTitle className="text-lg md:text-xl font-semibold text-foreground">
            Burnout Analysis
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] md:text-xs font-medium border ${getRiskBadgeStyle(data.risk_level)}`}
          >
            {data.risk_level} Risk
          </Badge>
        </div>
        <CardDescription className="text-sm">
          Training load assessment and recovery insights
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-1">
        <div
          className={`relative rounded-xl border p-6 ${colorScheme.bgStyle}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-border"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 -
                    (scorePercentage / 100) * (2 * Math.PI * 40)
                  }
                  className={`${colorScheme.text} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {data.risk_score}
                </span>
                <span className="text-xs text-muted-foreground">
                  Risk Score
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <RiskIcon className={`w-5 h-5 ${colorScheme.text}`} />
                <h3 className="text-lg font-semibold text-foreground">
                  {colorScheme.label}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {colorScheme.description}. Your risk score is calculated based
                on training frequency, consecutive workout days, and rest
                patterns over the last 30 days.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-lg bg-lightprimary">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {data.key_metrics.avg_sessions_per_week}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-foreground">
                  Avg Sessions/Week
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-lg bg-lightwarning">
                <Timer className="w-4 h-4 text-warning" />
              </div>
              <span className="text-2xl font-bold text-warning">
                {data.key_metrics.consecutive_training_days_max}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-foreground">
                  Max Consecutive
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 rounded-lg bg-lightsuccess">
                <Moon className="w-4 h-4 text-success" />
              </div>
              <span className="text-2xl font-bold text-success">
                {data.key_metrics.rest_days_last_30}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-foreground">
                  Rest Days (30d)
                </span>
              </div>
            </div>
          </div>
        </div>

        {data.warning_signs.length > 0 && (
          <div className="rounded-lg border bg-lightwarning/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    Warning Signs Detected
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Pay attention to these indicators
                  </p>
                </div>
              </div>

              <ul className="space-y-2 ml-1">
                {data.warning_signs.map((sign: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground text-sm"
                  >
                    <div className="mt-1 shrink-0">
                      <TrendingDown className="w-3.5 h-3.5 text-warning" />
                    </div>
                    <span className="leading-relaxed">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-lightinfo p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-info/20 shrink-0">
              <Zap className="w-5 h-5 text-info" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-foreground">
                Recovery Recommendation
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.recovery_suggestion}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
