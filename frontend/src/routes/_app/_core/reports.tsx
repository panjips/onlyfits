import { AttendanceAnalysis, BurnoutAnalysis, DASHBOARD_DATA } from "@/features/dashboard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/_core/reports")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
           <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
           </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Fitness Analysis Report</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
         <AttendanceAnalysis data={DASHBOARD_DATA.attendance_analysis} variant="default" />
         <BurnoutAnalysis data={DASHBOARD_DATA.burnout_analysis} variant="default" />
      </div>
    </section>
  );
}
