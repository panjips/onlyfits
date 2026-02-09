import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BranchResponse } from "@/features/branch";

export interface FilterByBranchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  branches?: BranchResponse[];
  isLoading?: boolean;
  disabled?: boolean;
}

export const FilterByBranch = ({
  value,
  onChange,
  placeholder = "All Branches",
  className,
  branches = [],
  isLoading = false,
  disabled = false,
}: FilterByBranchProps) => {
  return (
    <div className={className}>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={isLoading || !branches?.length || disabled}
      >
        <SelectTrigger className="min-w-[200px] gap-2 h-10!">
          <div className="flex items-center gap-2">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Branches</SelectItem>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            branches?.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                <div className="flex items-center gap-2">
                  <Building className="size-4" />
                  <span>{branch.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
