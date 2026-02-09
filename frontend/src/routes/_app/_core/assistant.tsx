import { AssistantPage } from "@/features/assistant/pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/assistant")({
  component: AssistantPage,
});
