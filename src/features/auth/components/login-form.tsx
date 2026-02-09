import { Link } from "@tanstack/react-router";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLoginForm } from "../hooks/use-login-form";
import { LogoIcon } from "./logo";

export const LoginForm = () => {
  const { handleLogin, isLoading, errors } = useLoginForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLogin({ email, password });
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
              Sign In to Onlyfits
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Sign in to continue
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm text-foreground">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id={useId()}
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

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-foreground">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot your Password?
                </Link>
              </div>
              <Input
                type="password"
                required
                autoComplete="current-password"
                name="password"
                id={useId()}
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

            <Button
              type="submit"
              className="w-full rounded"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-muted-foreground text-center text-sm">
            Don't have an account?
            <Link
              to="/register"
              className="px-2 text-primary hover:underline font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
};
