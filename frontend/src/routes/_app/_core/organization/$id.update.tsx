import {
  UpdateOrganizationPage,
  moduleListQuery,
  organizationDetailQuery,
} from "@/features/organization";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/_core/organization/$id/update"
)({
  beforeLoad: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.ensureQueryData(organizationDetailQuery(params.id)),
        context.queryClient.ensureQueryData(moduleListQuery()),
      ]);
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateOrganizationPage organizationId={id} />;
}
