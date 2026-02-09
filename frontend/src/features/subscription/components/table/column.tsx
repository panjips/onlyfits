import type { SubscriptionResponse } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, RefreshCw } from "lucide-react";

interface SubscriptionTableProps {
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onRenew?: (id: string, memberId: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "default";
    case "expired":
      return "destructive";
    case "pending":
      return "outline";
    case "cancelled":
      return "secondary";
    default:
      return "secondary";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getColumns = ({
  onUpdate,
  onDelete,
  onRenew,
}: SubscriptionTableProps): ColumnDef<SubscriptionResponse>[] => {
  return [
    {
      accessorKey: "memberId",
      header: "Member ID",
      cell: ({ row }) => {
        const memberId = row.original.memberId;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {memberId.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm">{formatDate(row.original.startDate)}</span>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm">{formatDate(row.original.endDate)}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status || "Unknown"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "planId",
      header: "Plan",
      cell: ({ row }) => {
        const planId = row.original.planId;
        if (!planId) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {planId.substring(0, 8)}...
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const { id, memberId, status } = row.original;
        const isActive = status?.toLowerCase() === "active";

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
            {onRenew && isActive && (
              <Button
                onClick={() => onRenew(id, memberId)}
                size={"sm"}
                variant={"lightsuccess"}
                className="size-8! rounded-sm"
              >
                <RefreshCw className="size-5" />
              </Button>
            )}
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
