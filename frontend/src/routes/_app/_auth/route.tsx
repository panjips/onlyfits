import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "@/provider";

export const Route = createFileRoute("/_app/_auth")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isAuthenticated } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, navigate]);
	return <Outlet />;
}
