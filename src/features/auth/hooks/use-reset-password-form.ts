import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ZodError } from "zod";
import { resetPasswordMutation } from "../api/api";
import { type ResetPasswordFormValues, resetPasswordSchema } from "../schemas";

interface ResetPasswordFormInput {
	token: string;
	password: string;
	confirmPassword: string;
}

export const useResetPasswordForm = () => {
	const mutation = useMutation(resetPasswordMutation);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ResetPasswordFormValues, string>>
	>({});
	const [isSuccess, setIsSuccess] = useState(false);

	const handleResetPassword = async (values: ResetPasswordFormInput) => {
		try {
			setErrors({});

			resetPasswordSchema.parse({
				password: values.password,
				confirmPassword: values.confirmPassword,
			});

			if (values.password !== values.confirmPassword) {
				setErrors({ confirmPassword: "Passwords do not match" });
				return;
			}

			await mutation.mutateAsync({
				token: values.token,
				password: values.password,
				confirmPassword: values.confirmPassword,
			});

			setIsSuccess(true);
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors: Partial<
					Record<keyof ResetPasswordFormValues, string>
				> = {};
				for (const e of err.issues) {
					if (e.path[0]) {
						fieldErrors[e.path[0] as keyof ResetPasswordFormValues] = e.message;
					}
				}
				setErrors(fieldErrors);
			}
		}
	};

	return {
		handleResetPassword,
		isLoading: mutation.isPending,
		errors,
		isSuccess,
	};
};
