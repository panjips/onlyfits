import { AnalyzePage } from "@/features/dashboard/pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/analyze")({
  component: AnalyzePage,
});
