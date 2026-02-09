import { createFileRoute } from "@tanstack/react-router";
import { UpdateMemberPage } from "@/features/member";

export const Route = createFileRoute("/_app/_core/members/$id/update")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateMemberPage memberId={id} />;
}
