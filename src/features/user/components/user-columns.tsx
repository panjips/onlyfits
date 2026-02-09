import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { UserResponse } from "../types";

export interface UserTableProps {
  onEdit?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
}: UserTableProps): ColumnDef<UserResponse>[] => [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      const initials =
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {initials || "?"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {user.fullName}
            </span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue<string>();
      const roleColors: Record<string, string> = {
        super_admin:
          "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        admin: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        staff:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        member:
          "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      };

      return (
        <Badge
          className={`${roleColors[role] || "bg-gray-100 text-gray-700"} px-2.5 py-0.5 rounded-full text-xs font-medium capitalize`}
        >
          {role?.replace("_", " ") || "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const isActive = getValue<boolean>();

      return (
        <Badge
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ getValue }) => {
      const date = getValue<string>();
      if (!date) return "-";

      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "action",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onEdit?.(row.original)}
            size={"sm"}
            variant={"lightprimary"}
            className="size-8! rounded-sm"
          >
            <Pencil className="size-5" />
          </Button>
          <Button
            onClick={() => onDelete?.(row.original)}
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
