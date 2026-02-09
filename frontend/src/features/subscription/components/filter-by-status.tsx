import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterByStatusProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

export const FilterByStatus = ({
  value,
  onChange,
  placeholder = "All Status",
  className,
  disabled = false,
}: FilterByStatusProps) => {
  return (
    <div className={className}>
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="min-w-[150px] gap-2 h-10!">
          <div className="flex items-center gap-2">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Status</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <span className="capitalize">{status.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
