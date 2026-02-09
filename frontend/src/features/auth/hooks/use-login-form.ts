import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { loginMutation } from "../api/api";
import { useUser } from "@/provider";
import { type LoginFormValues, loginSchema } from "../schemas";

export const useLoginForm = () => {
	const navigate = useNavigate();
	const mutation = useMutation(loginMutation);
	const { refetchUser } = useUser();
	const [errors, setErrors] = useState<
		Partial<Record<keyof LoginFormValues, string>>
	>({});

	const handleLogin = async (values: LoginFormValues) => {
		try {
			setErrors({});
			loginSchema.parse(values);

			await mutation.mutateAsync(values);

			await refetchUser();

			navigate({ to: "/dashboard" });
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
				for (const e of err.issues) {
					if (e.path[0]) {
						fieldErrors[e.path[0] as keyof LoginFormValues] = e.message;
					}
				}
				setErrors(fieldErrors);
			}
		}
	};

	return {
		handleLogin,
		isLoading: mutation.isPending,
		errors,
	};
};
