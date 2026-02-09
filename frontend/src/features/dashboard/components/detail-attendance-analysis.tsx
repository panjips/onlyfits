import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { type AttendanceAnalysisData } from "../types";
import { useWellnessAnalytics } from "../hooks/use-wellness-analytics";
import {
  CheckCircle2,
  Target,
  Award,
  ArrowUpRight,
  Calendar,
  BarChart3,
  Zap,
} from "lucide-react";

interface DetailAttendanceAnalysisProps {
  data?: AttendanceAnalysisData;
}

export const DetailAttendanceAnalysis = ({
  data: propData,
}: DetailAttendanceAnalysisProps) => {
  const { data: apiData, isLoading } = useWellnessAnalytics();
  const data = propData || apiData?.attendance_analysis;

  const getScoreStyle = (score: number) => {
    if (score >= 80)
      return "bg-success/10 border-success/20 dark:bg-success/20 dark:border-success/30";
    if (score >= 60)
      return "bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30";
    if (score >= 40)
      return "bg-warning/10 border-warning/20 dark:bg-warning/20 dark:border-warning/30";
    return "bg-error/10 border-error/20 dark:bg-error/20 dark:border-error/30";
  };

  const getConsistencyStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-lightsuccess text-success border-success/20";
      case "moderate":
        return "bg-lightwarning text-warning border-warning/20";
      case "low":
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
          <div className="relative rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-8">
            <div className="flex items-center gap-8">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="overflow-hidden shadow-md bg-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-semibold text-foreground">
            Attendance Analysis
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] md:text-xs font-medium border ${getConsistencyStyle(data.consistency_level)}`}
          >
            {data.consistency_level} Consistency
          </Badge>
        </div>
        <CardDescription className="text-sm">
          Your fitness habit insights and recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-1">
        <div
          className={`relative rounded-xl border p-6 ${getScoreStyle(data.score)}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-background border-2 border-border flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {data.score}
                  </span>
                  <span className="text-xs text-muted-foreground">of 100</span>
                </div>
              </div>
              {data.score >= 80 && (
                <div className="absolute -top-1 -right-1">
                  <div className="p-1.5 rounded-full bg-warning">
                    <Award className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2 justify-center md:justify-start">
                <Target className="w-5 h-5" />
                Attendance Score
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.score_explanation}
              </p>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Progress</span>
                  <span>{data.score}%</span>
                </div>
                <Progress value={data.score} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-lightprimary">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    Pattern Insight
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your workout habits
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.pattern_insight}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-lightwarning">
                  <Calendar className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    Renewal Behavior
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Membership patterns
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.renewal_behavior_insight}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-lightsuccess/50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-success/20 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-1.5">
                Great Progress!
                <ArrowUpRight className="w-3.5 h-3.5" />
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.positive_nudge}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-lightinfo p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-info/20 shrink-0">
              <Zap className="w-5 h-5 text-info" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-foreground">
                AI Recommendation
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.recommendation}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
