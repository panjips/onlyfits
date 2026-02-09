import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { planDetailQuery } from "../api";
import { usePlanForm } from "../hooks/use-plan-form";
import { usePlansContext } from "../provider";
import {
  createPlanSchema,
  updatePlanSchema,
  type PlanFormValues,
} from "../schemas";

interface PlanUpsertFormProps {
  mode: "create" | "update";
  planId?: string;
  redirectTo?: string;
}

const DURATION_OPTIONS = [
  { value: 1, label: "1 Day" },
  { value: 7, label: "1 Week" },
  { value: 14, label: "2 Weeks" },
  { value: 30, label: "1 Month" },
  { value: 60, label: "2 Months" },
  { value: 90, label: "3 Months" },
  { value: 180, label: "6 Months" },
  { value: 365, label: "1 Year" },
];

export const PlanUpsertForm = ({
  mode,
  planId,
  redirectTo = "/billing/plans",
}: PlanUpsertFormProps) => {
  const { handleSubmit: submitToApi, isLoading: isSubmitting } = usePlanForm({
    mode,
    planId,
    redirectTo,
  });

  const {
    selectedOrganizationId,
    organizations,
    isLoadingOrganizations,
    branches,
    isLoadingBranches,
    isAdmin,
  } = usePlansContext();

  const [schema] = useState(
    mode === "create" ? createPlanSchema : updatePlanSchema
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<PlanFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      organizationId: "",
      branchIds: [],
      name: "",
      description: "",
      price: 0,
      durationDays: 30,
      isActive: true,
    },
  });

  const { data: planData, isLoading: isLoadingPlan } = useQuery({
    ...planDetailQuery(planId || ""),
    enabled: mode === "update" && !!planId,
  });

  const selectedBranchIds = watch("branchIds") || [];
  const [priceInput, setPriceInput] = useState<string>("");

  // Set initial organization selection
  useEffect(() => {
    if (mode === "create" && selectedOrganizationId) {
      setValue("organizationId", selectedOrganizationId);
    }
  }, [mode, selectedOrganizationId, setValue]);

  // Initialize price input for create mode
  useEffect(() => {
    if (mode === "create") {
      setPriceInput("0");
    }
  }, [mode]);
  // Load plan data when updating
  useEffect(() => {
    if (mode === "update" && planData) {
      reset({
        organizationId: planData.organizationId,
        branchIds: planData.branchIds || [],
        name: planData.name,
        description: planData.description || "",
        price: planData.price,
        durationDays: planData.durationDays,
        isActive: planData.isActive ?? true,
      });
      setPriceInput(planData.price != null ? String(planData.price) : "");
    }
  }, [mode, planData, reset]);

  const onSubmit = (data: PlanFormValues) => {
    submitToApi(data);
  };

  const handleBranchToggle = (branchId: string) => {
    const current = selectedBranchIds || [];
    const updated = current.includes(branchId)
      ? current.filter((id) => id !== branchId)
      : [...current, branchId];
    setValue("branchIds", updated);
  };

  const isLoading =
    (mode === "update" && isLoadingPlan) ||
    isLoadingOrganizations ||
    isLoadingBranches;

  if (isLoading) {
    return (
      <div className="w-full lg:w-1/2 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Organization & Branch Selection */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Plan Assignment</CardTitle>
            <CardDescription>
              Assign this plan to an organization and optional branches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Organization Field */}
            <div className="space-y-2">
              <Label htmlFor="organizationId" className="text-sm font-medium">
                Organization <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mode === "update" || isAdmin}
                  >
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
              {isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Organization is locked to your assigned organization.
                </p>
              )}
              {errors.organizationId && (
                <p className="text-sm text-destructive">
                  {errors.organizationId.message}
                </p>
              )}
            </div>

            {/* Branch Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Branches{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional - leave empty for all branches)
                </span>
              </Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-3">
                {branches && branches.length > 0 ? (
                  branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`branch-${branch.id}`}
                        checked={selectedBranchIds.includes(branch.id)}
                        onCheckedChange={() => handleBranchToggle(branch.id)}
                      />
                      <label
                        htmlFor={`branch-${branch.id}`}
                        className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {branch.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No branches available for this organization.
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedBranchIds.length === 0
                  ? "Plan will be available for all branches."
                  : `Selected ${selectedBranchIds.length} branch${selectedBranchIds.length > 1 ? "es" : ""}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Details */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Enter the details for this membership plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Plan Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Monthly Premium"
                {...register("name")}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the benefits of this plan..."
                {...register("description")}
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (USD) <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => {
                  const formatUSD = (value: number) => {
                    return new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(value);
                  };

                  const currentValue = Number.parseFloat(priceInput) || 0;

                  return (
                    <div className="space-y-1.5">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="e.g. 99.99"
                        value={priceInput}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPriceInput(v);
                          const n = Number.parseFloat(v);
                          if (v !== "" && Number.isFinite(n)) {
                            field.onChange(n);
                          }
                        }}
                        onBlur={() => {
                          const v = priceInput.trim();
                          if (v === "") {
                            setPriceInput("0");
                            field.onChange(0);
                            return;
                          }
                          const n = Number.parseFloat(v);
                          const valid = Number.isFinite(n) ? n : 0;
                          field.onChange(valid);
                          setPriceInput(String(valid));
                        }}
                        className="h-11"
                        min={0}
                      />
                      {currentValue > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Preview:{" "}
                          <span className="font-semibold text-primary">
                            {formatUSD(currentValue)}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Duration Field */}
            <div className="space-y-2">
              <Label htmlFor="durationDays" className="text-sm font-medium">
                Duration <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="durationDays"
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.durationDays && (
                <p className="text-sm text-destructive">
                  {errors.durationDays.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                ? "Create Plan"
                : "Update Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
};
