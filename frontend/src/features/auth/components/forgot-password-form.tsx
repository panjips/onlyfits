import { Link } from "@tanstack/react-router";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";
import { LogoIcon } from "./logo";

export const ForgotPasswordForm = () => {
	const { handleForgotPassword, isLoading, errors, isSuccess } =
		useForgotPasswordForm();
	const [email, setEmail] = useState("");
	const emailId = useId();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		handleForgotPassword({ email });
	};

	if (isSuccess) {
		return (
			<section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
				<div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-lg border shadow-md shadow-zinc-950/5">
					<div className="bg-card -m-px rounded border p-8 pb-6">
						<div className="text-center">
							<Link
								to="/"
								aria-label="go home"
								className="mx-auto block w-fit text-foreground"
							>
								<LogoIcon />
							</Link>
							<h1 className="mb-1 mt-4 text-xl font-semibold text-foreground">
								Check Your Email
							</h1>
							<p className="text-sm text-muted-foreground">
								We've sent a password reset link to your email address. Please
								check your inbox and follow the instructions.
							</p>
						</div>

						<div className="mt-6">
							<Link to="/login">
								<Button type="button" variant="outline" className="w-full">
									Back to Sign In
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
			<form
				onSubmit={onSubmit}
				className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-lg border shadow-md shadow-zinc-950/5"
			>
				<div className="bg-card -m-px rounded border p-8 pb-6">
					<div className="text-center">
						<Link
							to="/"
							aria-label="go home"
							className="mx-auto block w-fit text-foreground"
						>
							<LogoIcon />
						</Link>
						<h1 className="mb-1 mt-4 text-xl font-semibold text-foreground">
							Forgot Password
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>

					<div className="mt-6 space-y-6">
						<div className="space-y-2">
							<Label htmlFor={emailId} className="block text-sm text-foreground">
								Email
							</Label>
							<Input
								type="email"
								required
								name="email"
								id={emailId}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="demo@example.com"
								className={cn(errors.email && "border-destructive")}
								disabled={isLoading}
								autoComplete="email"
							/>
							{errors.email && (
								<span className="text-xs text-destructive">{errors.email}</span>
							)}
						</div>

						<Button
							type="submit"
							className="w-full rounded"
							disabled={isLoading}
						>
							{isLoading ? "Sending..." : "Send Reset Link"}
						</Button>
					</div>
				</div>

				<div className="p-3">
					<p className="text-muted-foreground text-center text-sm">
						Remember your password?
						<Link
							to="/login"
							className="px-2 text-primary hover:underline font-medium"
						>
							Sign In
						</Link>
					</p>
				</div>
			</form>
		</section>
	);
};
