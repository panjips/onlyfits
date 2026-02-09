import { createFileRoute } from "@tanstack/react-router";
import { ListUserPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/")({
  component: ListUserPage,
});
