import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationResponse } from "@/features/organization";

export interface FilterByOrganizationProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  organizations?: OrganizationResponse[];
  isLoading?: boolean;
  disabled?: boolean;
}

export const FilterByOrganization = ({
  value,
  onChange,
  placeholder = "Select Organization",
  className,
  organizations = [],
  isLoading = false,
  disabled = false,
}: FilterByOrganizationProps) => {
  return (
    <div className={className}>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={isLoading || !organizations?.length || disabled}
      >
        <SelectTrigger className="min-w-[200px] gap-2 h-10!">
          <div className="flex items-center gap-2">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            organizations?.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  {org.logoUrl ? (
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="size-4 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                  <span>{org.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
