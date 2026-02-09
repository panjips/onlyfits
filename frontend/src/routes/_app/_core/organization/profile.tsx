import { OrganizationProfilePage } from "@/features/organization";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_app/_core/organization/profile",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <OrganizationProfilePage/>;
}
