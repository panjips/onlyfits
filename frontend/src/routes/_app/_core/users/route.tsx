import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserProvider } from "@/features/user/provider";

export const Route = createFileRoute("/_app/_core/users")({
  component: UserLayout,
});

function UserLayout() {
  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
}
