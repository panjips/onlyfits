import { UpdateBranchPage } from '@/features/branch'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_core/branches/$id/update')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  return <UpdateBranchPage branchId={id}/>
}
