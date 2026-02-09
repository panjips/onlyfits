import { ListMemberPage } from "@/features/member";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/members/")({
  component: ListMemberPage,
});
