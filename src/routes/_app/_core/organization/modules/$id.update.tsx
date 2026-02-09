import {
  UpdateModulePage,
  moduleDetailQuery,
} from "@/features/organization";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/_core/organization/modules/$id/update"
)({
  beforeLoad: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(moduleDetailQuery(params.id));
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateModulePage moduleId={id} />;
}
