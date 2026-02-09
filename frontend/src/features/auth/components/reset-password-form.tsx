import { Link, useSearch } from "@tanstack/react-router";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";
import { LogoIcon } from "./logo";

export const ResetPasswordForm = () => {
	const { token } = useSearch({ from: "/_app/_auth/reset-password" });
	const { handleResetPassword, isLoading, errors, isSuccess } =
		useResetPasswordForm();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const passwordId = useId();
	const confirmPasswordId = useId();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		handleResetPassword({ token: token || "", password, confirmPassword });
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
								Password Reset Successful
							</h1>
							<p className="text-sm text-muted-foreground">
								Your password has been successfully reset. You can now sign in
								with your new password.
							</p>
						</div>

						<div className="mt-6">
							<Button asChild className="w-full rounded">
								<Link to="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!token) {
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
								Invalid Reset Link
							</h1>
							<p className="text-sm text-muted-foreground">
								This password reset link is invalid or has expired. Please
								request a new one.
							</p>
						</div>

						<div className="mt-6">
							<Button asChild className="w-full rounded">
								<Link to="/forgot-password">Request New Link</Link>
							</Button>
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
							Reset Your Password
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your new password below
						</p>
					</div>

					<div className="mt-6 space-y-6">
						<div className="space-y-2">
							<Label
								htmlFor={passwordId}
								className="block text-sm text-foreground"
							>
								New Password
							</Label>
							<Input
								type="password"
								required
								name="password"
								id={passwordId}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={cn(errors.password && "border-destructive")}
								disabled={isLoading}
								autoComplete="new-password"
							/>
							{errors.password && (
								<span className="text-xs text-destructive">
									{errors.password}
								</span>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor={confirmPasswordId}
								className="block text-sm text-foreground"
							>
								Confirm New Password
							</Label>
							<Input
								type="password"
								required
								name="confirmPassword"
								id={confirmPasswordId}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className={cn(errors.confirmPassword && "border-destructive")}
								disabled={isLoading}
								autoComplete="new-password"
							/>
							{errors.confirmPassword && (
								<span className="text-xs text-destructive">
									{errors.confirmPassword}
								</span>
							)}
						</div>

						<Button
							type="submit"
							className="w-full rounded"
							disabled={isLoading}
						>
							{isLoading ? "Resetting Password..." : "Reset Password"}
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
							Sign in
						</Link>
					</p>
				</div>
			</form>
		</section>
	);
};
