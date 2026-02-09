import { createFileRoute } from "@tanstack/react-router";
import { ListTeamPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/team/")({
  component: ListTeamPage,
});
