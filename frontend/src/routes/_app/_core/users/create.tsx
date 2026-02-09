import { createFileRoute } from "@tanstack/react-router";
import { CreateUserPage } from "@/features/user";

export const Route = createFileRoute("/_app/_core/users/create")({
  component: CreateUserPage,
});
