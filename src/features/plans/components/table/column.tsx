import type { PlanResponse } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface PlanTableProps {
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDuration = (days: number) => {
  if (days === 1) return "1 Day";
  if (days === 7) return "1 Week";
  if (days === 14) return "2 Weeks";
  if (days === 30) return "1 Month";
  if (days === 60) return "2 Months";
  if (days === 90) return "3 Months";
  if (days === 180) return "6 Months";
  if (days === 365) return "1 Year";
  return `${days} Days`;
};

export const getColumns = ({
  onUpdate,
  onDelete,
}: PlanTableProps): ColumnDef<PlanResponse>[] => {
  return [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }) => {
        const { name, description } = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {description && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                {description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.price;
        return (
          <span className="font-semibold text-primary">
            {formatPrice(price)}
          </span>
        );
      },
    },
    {
      accessorKey: "durationDays",
      header: "Duration",
      cell: ({ row }) => {
        const duration = row.original.durationDays;
        return <span className="text-sm">{formatDuration(duration)}</span>;
      },
    },
    {
      accessorKey: "branchIds",
      header: "Branches",
      cell: ({ row }) => {
        const branchIds = row.original.branchIds;
        const count = branchIds?.length || 0;
        return (
          <Badge variant="outline" className="font-normal">
            {count === 0
              ? "All Branches"
              : `${count} Branch${count > 1 ? "es" : ""}`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive !== false ? "default" : "secondary"}>
            {isActive !== false ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onUpdate(id)}
              size={"sm"}
              variant={"lightprimary"}
              className="size-8! rounded-sm"
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              onClick={() => onDelete(id)}
              size={"sm"}
              variant={"lighterror"}
              className="size-8! rounded-sm"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        );
      },
    },
  ];
};
