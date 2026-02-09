import { Link } from "@tanstack/react-router";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRegisterForm } from "../hooks/use-register-form";
import { LogoIcon } from "./logo";

export const RegisterForm = () => {
	const { handleRegister, isLoading, errors } = useRegisterForm();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const emailId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();
	const firstNameId = useId();
	const lastNameId = useId();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		handleRegister({ email, password, confirmPassword, firstName, lastName });
	};

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
							Create your account
						</h1>
						<p className="text-sm text-muted-foreground">
							Join Onlyfits and start your fitness journey
						</p>
					</div>

					<div className="mt-6 space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label
									htmlFor={firstNameId}
									className="block text-sm text-foreground"
								>
									First Name
								</Label>
								<Input
									type="text"
									required
									name="firstName"
									id={firstNameId}
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="John"
									className={cn(errors.firstName && "border-destructive")}
									disabled={isLoading}
									autoComplete="given-name"
								/>
								{errors.firstName && (
									<span className="text-xs text-destructive">
										{errors.firstName}
									</span>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor={lastNameId}
									className="block text-sm text-foreground"
								>
									Last Name
								</Label>
								<Input
									type="text"
									required
									name="lastName"
									id={lastNameId}
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Doe"
									className={cn(errors.lastName && "border-destructive")}
									disabled={isLoading}
									autoComplete="family-name"
								/>
								{errors.lastName && (
									<span className="text-xs text-destructive">
										{errors.lastName}
									</span>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor={emailId}
								className="block text-sm text-foreground"
							>
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

						<div className="space-y-2">
							<Label
								htmlFor={passwordId}
								className="block text-sm text-foreground"
							>
								Password
							</Label>
							<Input
								type="password"
								required
								autoComplete="new-password"
								name="password"
								id={passwordId}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={cn(errors.password && "border-destructive")}
								disabled={isLoading}
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
								Confirm Password
							</Label>
							<Input
								type="password"
								required
								autoComplete="new-password"
								name="confirmPassword"
								id={confirmPasswordId}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className={cn(errors.confirmPassword && "border-destructive")}
								disabled={isLoading}
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
							{isLoading ? "Creating Account..." : "Create Account"}
						</Button>
					</div>
				</div>

				<div className="p-3">
					<p className="text-muted-foreground text-center text-sm">
						Already have an account?
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
