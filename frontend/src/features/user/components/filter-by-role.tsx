import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES, SUPER_ADMIN_ROLES } from "../types";

export interface FilterByRoleProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showAll?: boolean;
  includeSuperAdmin?: boolean;
}

export const FilterByRole = ({
  value,
  onChange,
  placeholder = "All Roles",
  className,
  disabled = false,
  showAll = true,
  includeSuperAdmin = false,
}: FilterByRoleProps) => {
  const roles = includeSuperAdmin ? SUPER_ADMIN_ROLES : USER_ROLES;

  return (
    <div className={className}>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="min-w-[150px] gap-2 h-10!">
          <div className="flex items-center gap-2">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {showAll && (
            <SelectItem value="all">
              <span className="text-muted-foreground">All Roles</span>
            </SelectItem>
          )}
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              <span className="capitalize">{role.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
