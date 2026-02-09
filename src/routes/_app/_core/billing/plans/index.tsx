import { ListPlanPage } from "@/features/plans";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/billing/plans/")({
  component: ListPlanPage,
});
