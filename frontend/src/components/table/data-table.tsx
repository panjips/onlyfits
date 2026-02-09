"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CellContext,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CardBox from "@/components/shared/card-box";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TableSkeleton } from "./table-skeleton";

const badgeColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export function getColorForValue(value: string) {
  const index =
    Math.abs(
      value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % badgeColors.length;
  return badgeColors[index];
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data?: TData[];
  extraComponents?: React.ReactNode;
  isLoading?: boolean;
}

export const DataTable = <TData, TValue>({
  columns: userColumns,
  data = [],
  extraComponents = <div></div>,
  isLoading = false,
}: DataTableProps<TData, TValue>) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      const canScrollLeft = tableContainer.scrollLeft > 0;
      const canScrollRight =
        tableContainer.scrollLeft <
        tableContainer.scrollWidth - tableContainer.clientWidth;

      if ((e.deltaY < 0 && canScrollLeft) || (e.deltaY > 0 && canScrollRight)) {
        e.preventDefault();
        tableContainer.scrollLeft += e.deltaY;
      }
    };

    tableContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      tableContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const renderValue = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const paginationOptions = useMemo(() => {
    return [5, 10, 20, 50];
  }, []);

  const columns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (userColumns) return userColumns;

    if (!data.length) return [];

    // Auto-generate columns if not provided
    const row = data[0] as Record<string, unknown>;
    const keys = Object.keys(row).filter((key) => {
      const val = row[key];
      return !Array.isArray(val);
    });

    const baseColumns = keys.map((col) => ({
      accessorKey: col,
      header: toTitleCase(col.replace(/([A-Z])/g, " $1").trim()),
      cell: (info: CellContext<TData, TValue>) => {
        const value = info.getValue() as unknown;

        if (
          [
            "status",
            "availability",
            "gender",
            "category",
            "genre",
            "position",
          ].some((key) => col.toLowerCase().includes(key))
        ) {
          const cls = getColorForValue(String(value));

          return (
            <Badge
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
            >
              {renderValue(value)}
            </Badge>
          );
        }

        if (col.toLowerCase().includes("rating")) {
          const ratingValue = Number(value) || 0;
          const maxRating = 5;
          const fullStars = Math.floor(ratingValue);
          const halfStar = ratingValue % 1 >= 0.5;
          const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

          return (
            <div className="flex items-center gap-0.5">
              {[...Array(fullStars)].map((_, i) => (
                <Icon
                  key={`full-${i}`}
                  icon="mdi:star"
                  className="text-[#f3d55b] w-6 h-6 shrink-0"
                />
              ))}
              {halfStar && (
                <Icon
                  icon="mdi:star-half-full"
                  className="text-[#f3d55b] w-6 h-6 shrink-0"
                />
              )}
              {[...Array(emptyStars)].map((_, i) => (
                <Icon
                  key={`empty-${i}`}
                  icon="mdi:star-outline"
                  className="text-[#f3d55b] w-6 h-6 shrink-0"
                />
              ))}
            </div>
          );
        }

        if (typeof value === "boolean") {
          return value ? (
            <Badge className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Inactive
            </Badge>
          ) : (
            <Badge className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Active
            </Badge>
          );
        }

        if (col.toLowerCase().includes("id")) {
          return (
            <span className="text-gray-900 dark:text-white font-medium max-w-50 truncate whitespace-nowrap">
              {renderValue(value)}
            </span>
          );
        }

        if (typeof value === "object" && value !== null) {
          const typedValue = value as Record<string, unknown>;
          const {
            image,
            imageUrl,
            thumbnailUrl,
            thumbnail,
            image_url,
            avatar,
            qrCode,
            profileImage,
            icon,
            ...rest
          } = typedValue;
          const keys = Object.keys(rest);

          return (
            <div className="flex items-center gap-2">
              {image ||
              imageUrl ||
              thumbnailUrl ||
              thumbnail ||
              image_url ||
              avatar ||
              qrCode ||
              profileImage ||
              icon ? (
                <img
                  src={
                    (image as string) ??
                    (imageUrl as string) ??
                    (thumbnailUrl as string) ??
                    (thumbnail as string) ??
                    (image_url as string) ??
                    (avatar as string) ??
                    (qrCode as string) ??
                    (profileImage as string) ??
                    (icon as string)
                  }
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <Badge className="size-10 flex items-center justify-center rounded-full shrink-0">
                  {keys[0] ? String(rest[keys[0]])[0]?.toUpperCase() : "?"}
                </Badge>
              )}
              <div className="flex flex-col">
                {keys.map((k) => {
                  const val = rest[k];
                  let displayValue;

                  const isTimestamp = (v: unknown) => {
                    if (typeof v !== "string") return false;
                    return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v);
                  };
                  if (isTimestamp(val)) return null;

                  if (typeof val === "object" && val !== null) {
                    if ("lat" in val && "lng" in val) {
                      displayValue = `${val.lat}, ${val.lng}`;
                    } else {
                      displayValue = JSON.stringify(val);
                    }
                  } else {
                    displayValue = val ?? "-";
                  }

                  return (
                    <span
                      key={k}
                      className={
                        k === "name"
                          ? "text-gray-900 dark:text-white font-semibold max-w-50 truncate whitespace-nowrap pe-6"
                          : "text-sm text-gray-500 dark:text-gray-400 max-w-50 truncate whitespace-nowrap pe-6"
                      }
                    >
                      {renderValue(displayValue)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        }

        if (typeof value === "string") {
          if (
            value?.includes("png") ||
            value?.includes("jpg") ||
            value?.includes("jpeg") ||
            value?.includes("svg") ||
            col.toLowerCase().includes("thumbnail") ||
            col.toLowerCase().includes("image")
          ) {
            return <img src={value} className="size-10 rounded-md" />;
          }
        }

        if (
          ["user", "product", "fullname", "name", "author"].some((key) =>
            col.toLowerCase().includes(key)
          )
        ) {
          const cls = getColorForValue(String(value));
          return (
            <div className="flex items-center gap-2">
              <Badge
                className={`size-10 flex items-center justify-center rounded-full shrink-0 ${cls}`}
              >
                {value ? String(value)[0]?.toUpperCase() : "?"}
              </Badge>
              <span className="text-gray-900 dark:text-white font-semibold max-w-50 truncate whitespace-nowrap">
                {renderValue(value)}
              </span>
            </div>
          );
        }

        return (
          <span className="text-gray-900 dark:text-white font-medium max-w-50 truncate block ">
            {renderValue(value)}
          </span>
        );
      },
      enableSorting: true,
      enableGlobalFilter: true,
    }));

    // Explicitly cast baseColumns to ColumnDef<TData, TValue>[]
    const castedBaseColumns = baseColumns as unknown as ColumnDef<
      TData,
      TValue
    >[];

    const actionColumn: ColumnDef<TData, TValue> = {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({}) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              size={"sm"}
              variant={"lightprimary"}
              className="size-8! rounded-full"
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              size={"sm"}
              variant={"lighterror"}
              className="size-8! rounded-full"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        );
      },
    };

    return [...castedBaseColumns, actionColumn];
  }, [data, userColumns]);

  // React Table Setup
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: paginationOptions[0] || 5 } },
  });

  // CSV Download
  const handleDownload = () => {
    if (!data.length) return;

    const headers = columns.map((col) => {
      if (typeof col.header === "string") return col.header;
      return col.id || "Column";
    });

    // Helper to get nested value
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const rows = data.map((item) =>
      columns.map((col) => {
        // Safe access to accessorKey
        const accessorKey = (col as any).accessorKey;
        let value = "";

        if (accessorKey) {
          value = getNestedValue(item, accessorKey);
        }

        if (Array.isArray(value)) return `"[array]"`;
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      })
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "table-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CardBox>
      <div>
        {isLoading ? (
          <>
            {/* Show filters while loading */}
            <div className="py-4 pt-0 flex items-center justify-between flex-wrap gap-4">
              {extraComponents}
            </div>
            {/* Show skeleton table */}
            <div className="overflow-x-auto border rounded-md border-ld scrollbar-small">
              <TableSkeleton columns={userColumns?.length || 5} rows={5} />
            </div>
          </>
        ) : (
          <>
            {/* Search + Download */}
            <div className="py-4 pt-0 flex items-center justify-between flex-wrap gap-4">
              {extraComponents}
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="text"
                  className="max-w-96 lg:min-w-96 min-w-full placeholder:text-gray-400 dark:placeholder:text-white/20"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search your relevant items..."
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      onClick={handleDownload}
                      className="p-2 px-4 rounded-md "
                    >
                      <Icon
                        icon="material-symbols:download-rounded"
                        width={24}
                        height={24}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-36" align="end">
                    <DropdownMenuLabel>Export</DropdownMenuLabel>
                    <DropdownMenuItem>PDF</DropdownMenuItem>
                    <DropdownMenuItem>Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Table */}
            <div
              ref={tableContainerRef}
              className="overflow-x-auto border rounded-md border-ld scrollbar-small"
            >
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="cursor-pointer select-none min-w-42 px-0"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? "flex items-center gap-1 px-4 cursor-pointer hover:bg-transparent text-dark dark:text-white font-semibold"
                                  : "px-4 font-semibold text-dark dark:text-white"
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() &&
                                ({
                                  asc: <ArrowUp className="w-4 h-4 inline" />,
                                  desc: (
                                    <ArrowDown className="w-4 h-4 inline" />
                                  ),
                                }[header.column.getIsSorted() as string] ??
                                  (header.column.id !== "action" ? (
                                    <ChevronsUpDown className="w-2 h-2 inline" />
                                  ) : null))}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-primary/10 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="text-gray-700 dark:text-white/70"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center p-6 text-gray-500 dark:text-white/70 font-medium"
                      >
                        {data.length === 0
                          ? "No data available."
                          : "No results found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-forest-black dark:text-white/90 font-medium text-base">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>

              <div className="flex items-center gap-2">
                <Label
                  htmlFor="pageSize"
                  className="mr-0 text-forest-black dark:text-white/90 text-base font-medium whitespace-nowrap min-w-32"
                >
                  Rows per page:
                </Label>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-18! cursor-pointer">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {paginationOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant={"secondary"}
                  //   className="disabled:bg-gray-300 dark:disabled:bg-white/30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  //   className="disabled:bg-gray-300 dark:disabled:bg-white/30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </CardBox>
  );
};
