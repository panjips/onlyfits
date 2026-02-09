import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ZodError } from "zod";
import { forgotPasswordMutation } from "../api/api";
import {
	type ForgotPasswordFormValues,
	forgotPasswordSchema,
} from "../schemas";

export const useForgotPasswordForm = () => {
	const mutation = useMutation(forgotPasswordMutation);
	const [isSuccess, setIsSuccess] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ForgotPasswordFormValues, string>>
	>({});

	const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
		try {
			setErrors({});
			forgotPasswordSchema.parse(values);

			await mutation.mutateAsync(values);

			setIsSuccess(true);
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors: Partial<
					Record<keyof ForgotPasswordFormValues, string>
				> = {};
				for (const e of err.issues) {
					if (e.path[0]) {
						fieldErrors[e.path[0] as keyof ForgotPasswordFormValues] =
							e.message;
					}
				}
				setErrors(fieldErrors);
			}
		}
	};

	return {
		handleForgotPassword,
		isLoading: mutation.isPending,
		isSuccess,
		errors,
	};
};
