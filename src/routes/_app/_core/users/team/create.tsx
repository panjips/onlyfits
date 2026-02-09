import { createFileRoute } from "@tanstack/react-router";
import { CreateTeamMemberPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/team/create")({
  component: CreateTeamMemberPage,
});
