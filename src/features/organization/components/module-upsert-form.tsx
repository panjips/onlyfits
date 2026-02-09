import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { moduleDetailQuery } from "../api/module-api";
import { useModuleForm } from "../hooks/use-module-form";
import type { ModuleFormValues } from "../schemas";
import { formattedDate } from "@/lib/utils";

interface ModuleUpsertFormProps {
  mode: "create" | "update";
  moduleId?: string;
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
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
    <div className="flex justify-end gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-40" />
    </div>
  </div>
);

export const ModuleUpsertForm = ({
  mode,
  moduleId,
  redirectTo = "/organization/modules",
}: ModuleUpsertFormProps) => {
  const { handleSubmit, isLoading, errors } = useModuleForm({
    mode,
    moduleId,
    redirectTo,
  });

  const { data: moduleData, isLoading: isLoadingModule } = useQuery({
    ...moduleDetailQuery(moduleId || ""),
    enabled: mode === "update" && !!moduleId,
  });

  const [formValues, setFormValues] = useState<ModuleFormValues>({
    key: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    if (mode === "update" && moduleData) {
      setFormValues({
        key: moduleData.key || "",
        name: moduleData.name || "",
        description: moduleData.description || "",
      });
    }
  }, [mode, moduleData]);

  const handleChange = (field: keyof ModuleFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formValues);
  };

  if (mode === "update" && isLoadingModule) {
    return (
      <div className="w-full lg:w-3/4">
        <FormSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2">
      {moduleId && moduleData?.createdAt && (
        <p className="pb-4 text-sm text-foreground">
          Created at {formattedDate(new Date(moduleData.createdAt))}
        </p>
      )}
      <form onSubmit={onFormSubmit} className="space-y-6">
        <Card className="border-border">
          <CardContent className="space-y-5">
            {/* Key Field */}
            <div className="space-y-2">
              <Label htmlFor="key" className="text-sm font-medium">
                Module Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="key"
                placeholder="module_key"
                value={formValues.key}
                onChange={(e) => handleChange("key", e.target.value)}
                className="h-11"
                disabled={mode === "update"}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier. Use lowercase letters, numbers, and underscores only.
              </p>
              {errors.key && (
                <p className="text-sm text-destructive">{errors.key}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Module Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter module name"
                value={formValues.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter module description (optional)"
                value={formValues.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Brief description of what this module does.
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
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
            disabled={isLoading}
            className="px-6 min-w-[140px]"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Module"
                : "Update Module"}
          </Button>
        </div>
      </form>
    </div>
  );
};
