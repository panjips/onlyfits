import { CreateOrganizationPage, moduleListQuery } from "@/features/organization";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/organization/create")({
  beforeLoad: async ({ context }) => {
    try {
      // Prefetch modules for the form
      await context.queryClient.ensureQueryData(moduleListQuery());
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateOrganizationPage />;
}
