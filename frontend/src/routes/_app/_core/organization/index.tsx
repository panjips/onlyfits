import { organizationListQuery } from '@/features/organization';
import { ListOrganizationPage } from '@/features/organization/pages/list-organization-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_core/organization/')({
  beforeLoad: async ({context}) => {
    try {
      await context.queryClient.ensureQueryData(organizationListQuery());
    } catch (error) {
      console.error(error);
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ListOrganizationPage/>
}
