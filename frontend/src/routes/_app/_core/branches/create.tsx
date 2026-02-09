import { CreateBranchPage } from "@/features/branch";
import { organizationListQuery } from "@/features/organization";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_core/branches/create")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(organizationListQuery());
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateBranchPage />;
}
