import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_core/billing/plans/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/_core/billing/plans/create"!</div>
}
