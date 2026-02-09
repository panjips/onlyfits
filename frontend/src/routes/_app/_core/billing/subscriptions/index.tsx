import { ListSubscriptionPage } from "@/features/subscription";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/billing/subscriptions/")({
  component: ListSubscriptionPage,
});
