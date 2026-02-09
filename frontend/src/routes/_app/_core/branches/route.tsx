import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BranchProvider } from "@/features/branch/provider";

export const Route = createFileRoute("/_app/_core/branches")({
  component: BranchLayout,
});

function BranchLayout() {
  return (
    <BranchProvider>
      <Outlet />
    </BranchProvider>
  );
}
