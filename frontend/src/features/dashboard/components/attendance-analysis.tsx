import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type AttendanceAnalysisData as AttendanceAnalysisType } from "../types";
import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { useWellnessAnalytics } from "../hooks/use-wellness-analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceAnalysisProps {
  data?: AttendanceAnalysisType;
  variant?: "default" | "compact";
}

export const AttendanceAnalysis = ({
  data: propData,
  variant = "default",
}: AttendanceAnalysisProps) => {
  const { data: apiData, isLoading } = useWellnessAnalytics();
  const data = propData || apiData?.attendance_analysis;
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            {!isCompact && <Skeleton className="h-4 w-full mt-2" />}
          </div>
          {!isCompact && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Attendance Analysis
          </CardTitle>
          <Badge
            variant={
              data.consistency_level === "High" ? "default" : "secondary"
            }
            className={`flex items-center gap-1.5 px-3 py-1 whitespace-nowrap ${data.consistency_level === "High" ? "animate-pulse" : ""}`}
          >
            {data.consistency_level} Consistency
          </Badge>
        </div>
        <CardDescription>Your fitness habit insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        {/* Score Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Attendance Score
            </span>
            <span className="font-bold text-2xl">{data.score}/100</span>
          </div>
          <Progress value={data.score} className="h-2" />
          {!isCompact && (
            <p className="text-sm text-muted-foreground mt-2">
              {data.score_explanation}
            </p>
          )}
        </div>

        {!isCompact && (
          <>
            {/* Insights Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold text-sm">Pattern Insight</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.pattern_insight}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="w-4 h-4" />
                  <span className="font-semibold text-sm">Renewal Insight</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.renewal_behavior_insight}
                </p>
              </div>
            </div>

            {/* Positive Nudge & Recommendation */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {data.positive_nudge}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-sm font-medium text-primary">
                  💡 Recommendation: {data.recommendation}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
