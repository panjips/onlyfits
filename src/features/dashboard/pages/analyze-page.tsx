import { TitlePage } from "@/components/shared";
import {
  DetailAttendanceAnalysis,
  DetailBurnoutAnalysis,
} from "@/features/dashboard";
import { Loader2 } from "lucide-react";

export const AnalyzePage = () => {
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="relative p-4 rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Analyzing your wellness data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TitlePage
        title="Wellness Analysis"
        description="AI-powered insights into your fitness journey"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DetailAttendanceAnalysis />
        <DetailBurnoutAnalysis />
      </div>
    </div>
  );
};
