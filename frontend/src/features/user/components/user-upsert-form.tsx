import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { userDetailQuery } from "../api";
import { useUserForm } from "../hooks/use-user-form";
import { useUserContext } from "../provider";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "../schemas";
import { USER_ROLES, SUPER_ADMIN_ROLES, type UserRole } from "../types";
import { useUser } from "@/provider";
import { branchListQuery } from "@/features/branch";

interface UserUpsertFormProps {
  mode: "create" | "update";
  userId?: string;
  redirectTo?: string;
  /** When true, operates in "team" mode for admin users managing their organization */
  isTeamMode?: boolean;
}

type UserFormValues = CreateUserFormValues | UpdateUserFormValues;

export const UserUpsertForm = ({
  mode,
  userId,
  redirectTo = "/users",
  isTeamMode = false,
}: UserUpsertFormProps) => {
  const { handleSubmit: submitToApi, isLoading: isSubmitting } = useUserForm({
    mode,
    userId,
    redirectTo,
  });

  const { user: currentUser } = useUser();
  const { selectedOrganizationId, organizations, isLoadingOrganizations } =
    useUserContext();

  const isSuperAdmin = currentUser?.role === "super_admin";

  // Get available roles based on user role and mode
  const availableRoles =
    isSuperAdmin && !isTeamMode ? SUPER_ADMIN_ROLES : USER_ROLES;

  const [schema] = useState(() =>
    mode === "create" ? createUserSchema : updateUserSchema
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues:
      mode === "create"
        ? {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            role: "staff" as UserRole,
            organizationId: "",
            branchId: "",
          }
        : {
            email: "",
            firstName: "",
            lastName: "",
            role: "staff" as UserRole,
            isActive: true,
          },
  });

  const watchedOrganizationId = watch("organizationId" as any);

  // Fetch branches based on selected organization
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    ...branchListQuery({
      organizationId:
        mode === "create"
          ? watchedOrganizationId || selectedOrganizationId
          : selectedOrganizationId,
    }),
    enabled:
      mode === "create" && !!(watchedOrganizationId || selectedOrganizationId),
  });

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    ...userDetailQuery(userId || ""),
    enabled: mode === "update" && !!userId,
  });

  // Set initial organization ID for admin users or when in team mode
  useEffect(() => {
    if (mode === "create") {
      if (isTeamMode && currentUser?.organizationId) {
        setValue("organizationId" as any, currentUser.organizationId);
      } else if (selectedOrganizationId) {
        setValue("organizationId" as any, selectedOrganizationId);
      }
    }
  }, [
    mode,
    isTeamMode,
    currentUser?.organizationId,
    selectedOrganizationId,
    setValue,
  ]);

  // Populate form with user data when in update mode
  useEffect(() => {
    if (mode === "update" && userData) {
      reset({
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: (userData.role as UserRole) || "staff",
        isActive: userData.isActive,
      });
    }
  }, [mode, userData, reset]);

  const onSubmit = (data: UserFormValues) => {
    submitToApi(data as any);
  };

  const isLoading =
    (mode === "update" && isLoadingUser) || isLoadingOrganizations;

  if (isLoading) {
    return (
      <div className="w-full lg:w-1/2 space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Information Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Enter the details for the new user."
                : "Update the user's information."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Organization Field - Only show for super_admin in create mode or when not in team mode */}
            {mode === "create" && isSuperAdmin && !isTeamMode && (
              <div className="space-y-2">
                <Label htmlFor="organizationId" className="text-sm font-medium">
                  Organization <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name={"organizationId" as any}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations?.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {(errors as any).organizationId && (
                  <p className="text-sm text-destructive">
                    {(errors as any).organizationId.message}
                  </p>
                )}
              </div>
            )}

            {/* Branch Field - Only show in create mode */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="branchId" className="text-sm font-medium">
                  Branch
                </Label>
                <Controller
                  name={"branchId" as any}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isLoadingBranches}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingBranches
                              ? "Loading branches..."
                              : "Select Branch"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {(errors as any).branchId && (
                  <p className="text-sm text-destructive">
                    {(errors as any).branchId.message}
                  </p>
                )}
              </div>
            )}

            {/* First Name Field */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...register("firstName")}
                className="h-11"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...register("lastName")}
                className="h-11"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email")}
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field - Only for create mode */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min. 8 characters)"
                  {...register("password" as any)}
                  className="h-11"
                />
                {(errors as any).password && (
                  <p className="text-sm text-destructive">
                    {(errors as any).password.message}
                  </p>
                )}
              </div>
            )}

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Card - Only for update mode */}
        {mode === "update" && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Manage the user's account status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this user account.
                  </p>
                </div>
                <Controller
                  name={"isActive" as any}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 min-w-[140px]"
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create User"
                : "Update User"}
          </Button>
        </div>
      </form>
    </div>
  );
};
