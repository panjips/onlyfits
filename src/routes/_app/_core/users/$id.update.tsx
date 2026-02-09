import { createFileRoute } from "@tanstack/react-router";
import { UpdateUserPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/$id/update")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateUserPage userId={id} />;
}
