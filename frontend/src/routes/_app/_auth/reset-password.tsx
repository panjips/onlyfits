import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordPage } from "@/features/auth";

const resetPasswordSearchSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/_app/_auth/reset-password")({
	validateSearch: resetPasswordSearchSchema,
	component: ResetPasswordPage,
});
