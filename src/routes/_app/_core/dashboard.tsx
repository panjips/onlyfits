import {
  BannerWelcome,
  AttendanceAnalysis,
  BurnoutAnalysis,
  BannerAssistant,
} from "@/features/dashboard";
import { AttendanceChart } from "@/features/dashboard/components/attendance-chart";
import { MembershipInfo } from "@/features/dashboard/components/membership-info";
import { VisitorChart } from "@/features/dashboard/components/visitor-chart";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="space-y-6">
      <BannerWelcome />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MembershipInfo />
        </div>
        <VisitorChart />
      </div>
      <AttendanceChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceAnalysis variant="compact" />
        <BurnoutAnalysis variant="compact" />
      </div>
      <BannerAssistant />
    </section>
  );
}
