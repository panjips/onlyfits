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
import { memberDetailQuery } from "../api";
import { useMemberForm } from "../hooks/use-member-form";
import { useMemberContext } from "../provider";
import { organizationPlanListQuery } from "@/features/plans";
import { userByEmailQuery } from "@/features/user";
import {
  createMemberSchema,
  updateMemberSchema,
  type MemberFormValues,
} from "../schemas";
import { useDebounce } from "@/hooks/use-debounce";

interface MemberUpsertFormProps {
  mode: "create" | "update";
  memberId?: string;
  redirectTo?: string;
}

const MEMBER_STATUS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export const MemberUpsertForm = ({
  mode,
  memberId,
  redirectTo = "/members",
}: MemberUpsertFormProps) => {
  const { handleSubmit: submitToApi, isLoading: isSubmitting } = useMemberForm({
    mode,
    memberId,
    redirectTo,
  });

  const {
    userOrganizationId,
    branches,
    isLoadingBranches,
    isStaff,
    userBranchId,
  } = useMemberContext();

  const [schema] = useState(
    mode === "create" ? createMemberSchema : updateMemberSchema,
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<MemberFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      email: "",
      organizationId: userOrganizationId || "",
      homeBranchId: isStaff ? userBranchId || "" : "",
      planId: "",
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const { data: memberData, isLoading: isLoadingMember } = useQuery({
    ...memberDetailQuery(memberId || ""),
    enabled: mode === "update" && !!memberId,
  });

  // Fetch plans based on organization
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    ...organizationPlanListQuery({
      organizationId: userOrganizationId,
    }),
    enabled: !!userOrganizationId,
  });

  // Email debounce and user lookup
  const [emailInput, setEmailInput] = useState("");
  const debouncedEmail = useDebounce(emailInput, 500);

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    ...userByEmailQuery(debouncedEmail),
    enabled:
      mode === "create" && !!debouncedEmail && debouncedEmail.includes("@"),
  });

  // Set organization ID on mount
  useEffect(() => {
    if (userOrganizationId) {
      setValue("organizationId", userOrganizationId);
    }
    if (isStaff && userBranchId) {
      setValue("homeBranchId", userBranchId);
    }
  }, [userOrganizationId, userBranchId, isStaff, setValue]);

  // Load member data when updating
  useEffect(() => {
    if (mode === "update" && memberData) {
      reset({
        organizationId: memberData.organizationId,
        homeBranchId: memberData.homeBranchId || "",
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        phone: memberData.phone || "",
        dateOfBirth: memberData.dateOfBirth || "",
        status: memberData.status || "active",
        joinDate: memberData.joinDate || "",
        notes: memberData.notes || "",
      });
    }
  }, [mode, memberData, reset]);

  // Auto-fill user data when email is found
  useEffect(() => {
    if (mode === "create" && userData) {
      setValue("firstName", userData.firstName || "");
      setValue("lastName", userData.lastName || "");
    }
  }, [mode, userData, setValue]);

  const onSubmit = (data: MemberFormValues) => {
    submitToApi(data);
  };

  const isLoading =
    (mode === "update" && isLoadingMember) ||
    isLoadingBranches ||
    isLoadingPlans;

  if (isLoading) {
    return (
      <div className="w-full lg:w-1/2 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Member Assignment */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Member Assignment</CardTitle>
            <CardDescription>
              Assign member to organization, branch, and membership plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email Field (Create only) */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional - link to existing user)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setValue("email", e.target.value || null);
                  }}
                  className="h-11"
                />
                {isLoadingUser && (
                  <p className="text-xs text-muted-foreground">
                    Searching for user...
                  </p>
                )}
                {debouncedEmail && !isLoadingUser && userData && (
                  <p className="text-xs text-green-600">
                    ✓ User found: {userData.fullName}
                  </p>
                )}
                {debouncedEmail &&
                  !isLoadingUser &&
                  !userData &&
                  debouncedEmail.includes("@") && (
                    <p className="text-xs text-muted-foreground">
                      No user found with this email
                    </p>
                  )}
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}

            {/* Branch Field */}
            <div className="space-y-2">
              <Label htmlFor="homeBranchId" className="text-sm font-medium">
                Home Branch <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="homeBranchId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isStaff}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
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
              {isStaff && (
                <p className="text-xs text-muted-foreground">
                  Branch is locked to your assigned branch.
                </p>
              )}
              {errors.homeBranchId && (
                <p className="text-sm text-destructive">
                  {errors.homeBranchId.message}
                </p>
              )}
            </div>

            {/* Plan Field */}
            <div className="space-y-2">
              <Label htmlFor="planId" className="text-sm font-medium">
                Membership Plan <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="planId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price} ({plan.durationDays} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.planId && (
                <p className="text-sm text-destructive">
                  {errors.planId.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Enter the member's personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                className="h-11"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
                className="h-11"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
                className="h-11"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="h-11"
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <Label htmlFor="joinDate" className="text-sm font-medium">
                Join Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="joinDate"
                type="date"
                {...register("joinDate")}
                className="h-11"
              />
              {errors.joinDate && (
                <p className="text-sm text-destructive">
                  {errors.joinDate.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "active"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this member..."
                {...register("notes")}
                className="min-h-[100px]"
              />
              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
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
                ? "Create Member"
                : "Update Member"}
          </Button>
        </div>
      </form>
    </div>
  );
};
