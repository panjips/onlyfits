import type { MemberResponse } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberTableProps {
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    case "pending":
      return "outline";
    default:
      return "secondary";
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

export const getColumns = ({
  onUpdate,
  onDelete,
}: MemberTableProps): ColumnDef<MemberResponse>[] => {
  return [
    {
      accessorKey: "name",
      header: "Member",
      cell: ({ row }) => {
        const { firstName, lastName, phone } = row.original;
        const fullName = `${firstName} ${lastName}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{fullName}</span>
              {phone && (
                <span className="text-xs text-muted-foreground">{phone}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: "Date of Birth",
      cell: ({ row }) => {
        const dob = row.original.dateOfBirth;
        if (!dob) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm">
            {new Date(dob).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "joinDate",
      header: "Join Date",
      cell: ({ row }) => {
        const joinDate = row.original.joinDate;
        if (!joinDate) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm">
            {new Date(joinDate).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
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
