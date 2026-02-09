import { SubscriptionProvider } from "@/features/subscription";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/billing/subscriptions")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SubscriptionProvider>
      <Outlet />
    </SubscriptionProvider>
  );
}
