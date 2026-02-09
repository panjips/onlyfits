import { PlansProvider } from "@/features/plans";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/billing/plans")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PlansProvider>
      <Outlet />
    </PlansProvider>
  );
}
