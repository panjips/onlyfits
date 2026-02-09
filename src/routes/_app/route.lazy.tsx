import { Outlet, createLazyFileRoute } from "@tanstack/react-router";
import { UserProvider } from "@/provider";
export const Route = createLazyFileRoute("/_app")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UserProvider>
			<Outlet />
		</UserProvider>
	)
}
