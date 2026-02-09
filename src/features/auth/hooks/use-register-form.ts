import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { registerMutation } from "../api/api";
import { type RegisterFormValues, registerSchema } from "../schemas";

export const useRegisterForm = () => {
	const navigate = useNavigate();
	const mutation = useMutation(registerMutation);
	const [errors, setErrors] = useState<
		Partial<Record<keyof RegisterFormValues, string>>
	>({});

	const handleRegister = async (values: RegisterFormValues) => {
		try {
			setErrors({});
			const validatedData = registerSchema.parse(values);
			if (validatedData.password !== validatedData.confirmPassword) {
				setErrors({ confirmPassword: "Passwords do not match" });
				return;
			}

			await mutation.mutateAsync(values);

			navigate({ to: "/login" });
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> =
					{};
				for (const e of err.issues) {
					if (e.path[0]) {
						fieldErrors[e.path[0] as keyof RegisterFormValues] = e.message;
					}
				}
				setErrors(fieldErrors);
			}
		}
	};

	return {
		handleRegister,
		isLoading: mutation.isPending,
		errors,
	};
};
