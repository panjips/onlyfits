import { ModuleConfigPage, moduleListQuery } from '@/features/organization';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_core/organization/modules/')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(moduleListQuery());
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ModuleConfigPage />;
}