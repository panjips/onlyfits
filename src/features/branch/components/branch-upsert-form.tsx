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
import { branchDetailQuery } from "../api";
import { useBranchForm } from "../hooks/use-branch-form";
import { useBranchContext } from "../provider";
import {
  createBranchSchema,
  updateBranchSchema,
  type BranchFormValues,
} from "../schemas";

interface BranchUpsertFormProps {
  mode: "create" | "update";
  branchId?: string;
  redirectTo?: string;
}

const TIMEZONES = [
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+8)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
];

export const BranchUpsertForm = ({
  mode,
  branchId,
  redirectTo = "/branches",
}: BranchUpsertFormProps) => {
  const { handleSubmit: submitToApi, isLoading: isSubmitting } = useBranchForm({
    mode,
    branchId,
    redirectTo,
  });

  const { selectedOrganizationId, organizations, isLoadingOrganizations } =
    useBranchContext();

  const [schema] = useState(
    mode === "create" ? createBranchSchema : updateBranchSchema
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<BranchFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      organizationId: "",
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      timezone: "",
      isActive: true,
    },
  });

  const { data: branchData, isLoading: isLoadingBranch } = useQuery({
    ...branchDetailQuery(branchId || ""),
    enabled: mode === "update" && !!branchId,
  });

  useEffect(() => {
    if (mode === "create" && selectedOrganizationId) {
      setValue("organizationId", selectedOrganizationId);
    }
  }, [mode, selectedOrganizationId, setValue]);

  useEffect(() => {
    if (mode === "update" && branchData) {
      reset({
        organizationId: branchData.organizationId,
        name: branchData.name,
        code: branchData.code || "",
        address: branchData.address || "",
        phone: branchData.phone || "",
        email: branchData.email || "",
        timezone: branchData.timezone || "",
        isActive: branchData.isActive,
      });
    }
  }, [mode, branchData, reset]);

  const onSubmit = (data: BranchFormValues) => {
    submitToApi(data);
  };

  const isLoading =
    (mode === "update" && isLoadingBranch) || isLoadingOrganizations;

  if (isLoading) {
    return (
      <div className="w-full lg:w-1/2 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
            <CardDescription>
              Enter the details for this branch location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organizationId" className="text-sm font-medium">
                Organization <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <Select {...field} disabled={mode === "update"}>
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
              {errors.organizationId && (
                <p className="text-sm text-destructive">
                  {errors.organizationId.message}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Branch Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter branch name"
                {...register("name")}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Branch Code
              </Label>
              <Input
                id="code"
                placeholder="e.g. JK-001"
                {...register("code")}
                className="h-11"
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Timezone Field */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">
                Timezone
              </Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.timezone && (
                <p className="text-sm text-destructive">
                  {errors.timezone.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Address and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="branch@example.com"
                {...register("email")}
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+62..."
                {...register("phone")}
                className="h-11"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                placeholder="Full address"
                {...register("address")}
                className="h-11"
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                ? "Create Branch"
                : "Update Branch"}
          </Button>
        </div>
      </form>
    </div>
  );
};
