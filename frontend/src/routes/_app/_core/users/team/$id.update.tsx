import { createFileRoute } from "@tanstack/react-router";
import { UpdateTeamMemberPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/team/$id/update")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateTeamMemberPage userId={id} />;
}
