import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberProvider } from "@/features/member/provider";

export const Route = createFileRoute("/_app/_core/members")({
  component: MemberLayout,
});

function MemberLayout() {
  return (
    <MemberProvider>
      <Outlet />
    </MemberProvider>
  );
}
