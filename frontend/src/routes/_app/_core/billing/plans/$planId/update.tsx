import { UpdatePlanPage } from "@/features/plans";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/_core/billing/plans/$planId/update"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = Route.useParams();
  return <UpdatePlanPage planId={planId} />;
}
