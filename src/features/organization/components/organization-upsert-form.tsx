import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { moduleListQuery } from "../api/module-api";
import { organizationDetailQuery } from "../api/org-api";
import { useOrganizationForm } from "../hooks/use-organization-form";
import type { OrganizationFormValues } from "../schemas";
import { formattedDate } from "@/lib/utils";

interface OrganizationUpsertFormProps {
  mode: "create" | "update";
  organizationId?: string;
  redirectTo?: string;
}

const FormSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <div className="flex justify-end gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-40" />
    </div>
  </div>
);

const ModulesSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex items-start space-x-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const OrganizationUpsertForm = ({
  mode,
  organizationId,
  redirectTo = "/organization",
}: OrganizationUpsertFormProps) => {
  const { handleSubmit, isLoading, errors } = useOrganizationForm({
    mode,
    organizationId,
    redirectTo,
  });

  const { data: modules, isLoading: isLoadingModules } = useQuery(moduleListQuery());

  const { data: organizationData, isLoading: isLoadingOrg } = useQuery({
    ...organizationDetailQuery(organizationId || ""),
    enabled: mode === "update" && !!organizationId,
  });

  const [formValues, setFormValues] = useState<OrganizationFormValues>({
    name: "",
    slug: "",
    logoUrl: "",
    moduleIds: [],
  });

  useEffect(() => {
    if (mode === "update" && organizationData) {
      setFormValues({
        name: organizationData.name || "",
        slug: organizationData.slug || "",
        logoUrl: organizationData.logoUrl || "",
        config: organizationData.config,
        moduleIds: organizationData.modules?.map((module) => module.id) || [],
      });
    }
  }, [mode, organizationData]);

  const handleChange = (field: keyof OrganizationFormValues, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    setFormValues((prev) => {
      const currentModules = prev.moduleIds || [];
      if (checked) {
        return { ...prev, moduleIds: [...currentModules, moduleId] };
      }
      return { ...prev, moduleIds: currentModules.filter((id) => id !== moduleId) };
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formValues);
  };

  if (mode === "update" && isLoadingOrg) {
    return (
      <div className="w-full lg:w-3/4">
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
        {
            organizationId && (
                <p className="pb-4 text-sm text-foreground">Last updated at {formattedDate(new Date(organizationData?.updatedAt || ""))}</p>
            )
        }
      <form onSubmit={onFormSubmit} className="space-y-6">
        <Card className="border-border">
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                value={formValues.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="organization-slug"
                value={formValues.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Use lowercase letters, numbers, and hyphens only.
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug}</p>
              )}
            </div>

            {/* Logo URL Field */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-sm font-medium">
                Logo URL
              </Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                value={formValues.logoUrl || ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Provide a URL to your organization's logo.
              </p>
              {errors.logoUrl && (
                <p className="text-sm text-destructive">{errors.logoUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Modules</CardTitle>
            <CardDescription>
              Select the modules to enable for this organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingModules ? (
              <ModulesSkeleton />
            ) : modules?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground font-medium">No modules available</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Modules will appear here once created.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {modules?.map((module) => (
                  <label
                    key={module.id}
                    htmlFor={`module-${module.id}`}
                    className={`
                      flex items-start space-x-3 rounded-lg border p-4 cursor-pointer
                      transition-all duration-200 hover:border-primary/50 hover:bg-muted/30
                      ${formValues.moduleIds?.includes(module.id) 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                        : "border-border"
                      }
                    `}
                  >
                    <Checkbox
                      id={`module-${module.id}`}
                      checked={formValues.moduleIds?.includes(module.id) || false}
                      onCheckedChange={(checked) =>
                        handleModuleToggle(module.id, checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-sm font-medium leading-none">
                        {module.name}
                      </span>
                      {module.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
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
            disabled={isLoading}
            className="px-6 min-w-[140px]"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Organization"
                : "Update Organization"}
          </Button>
        </div>
      </form>
    </div>
  );
};
