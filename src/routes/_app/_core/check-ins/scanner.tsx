import { createFileRoute } from '@tanstack/react-router'
import { ScannerPage } from '@/features/check-in/pages'

export const Route = createFileRoute('/_app/_core/check-ins/scanner')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ScannerPage />
}
