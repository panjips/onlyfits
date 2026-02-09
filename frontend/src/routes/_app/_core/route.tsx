import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { AppLoading } from "@/components/shared/app-loading";
import { Header } from "@/components/header/header";
import { ModalProvider } from "@/provider";
import React from "react";
const Sidebar = React.lazy(() =>
  import("@/components/sidebar/sidebar").then((module) => ({
    default: module.Sidebar,
  })),
);
import { profileQuery } from "@/features/dashboard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/_core")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(profileQuery);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  pendingComponent: AppLoading,
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const isAssistantPage = location.pathname.includes("/assistant");

  return (
    <ModalProvider>
      <div className="flex w-full min-h-screen">
        <div className="page-wrapper flex w-full ">
          <div className="xl:block hidden">
            <Sidebar />
          </div>
          <div className="body-wrapper w-full bg-white dark:bg-dark">
            <Header />

            <div
              className={cn(
                "mx-auto transition-all",
                isAssistantPage
                  ? "w-full p-0 h-[calc(100vh-6rem)]"
                  : "container px-6 py-30",
              )}
            >
              <main className="grow h-full">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </ModalProvider>
  );
}
