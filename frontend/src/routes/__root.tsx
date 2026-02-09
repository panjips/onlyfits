import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";
import { ThemeProvider } from "@/provider/theme-provider";
import TanStackQueryDevtools from "../lib/tanstack-query/devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<ThemeProvider defaultTheme="light" storageKey="ui-theme">
			<Outlet />
			<Toaster richColors={true} position="bottom-center" theme="light" />
			{env.VITE_APP_ENV === "development" && (
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
			)}
		</ThemeProvider>
	),
});
