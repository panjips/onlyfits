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
  showAll?: boolean;
}

export const FilterByBranch = ({
  value,
  onChange,
  placeholder = "All Branches",
  className,
  branches = [],
  isLoading = false,
  disabled = false,
  showAll = true,
}: FilterByBranchProps) => {
  return (
    <div className={className}>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="min-w-[180px] gap-2 h-10!">
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
            <>
              {showAll && (
                <SelectItem value="all">
                  <span className="text-muted-foreground">All Branches</span>
                </SelectItem>
              )}
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  <div className="flex items-center gap-2">
                    <span>{branch.name}</span>
                    {branch.code && (
                      <span className="text-muted-foreground text-xs">
                        ({branch.code})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
