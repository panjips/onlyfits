import type { BranchResponse } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

interface BranchTableProps {
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const getColumns = ({ onUpdate, onDelete }: BranchTableProps): ColumnDef<BranchResponse>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { name, code } = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {code && <span className="text-xs text-muted-foreground">{code}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => {
        const address = row.original.address;
        return address ? (
          <span className="text-sm truncate max-w-[200px] block">{address}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.original.phone;
        return phone || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'timezone',
      header: 'Timezone',
      cell: ({ row }) => {
        const timezone = row.original.timezone;
        return timezone || <span className="text-muted-foreground">UTC</span>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'action',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button onClick={() => onUpdate(id)} size={'sm'} variant={'lightprimary'} className="size-8! rounded-sm">
              <Pencil className="size-5" />
            </Button>
            <Button onClick={() => onDelete(id)} size={'sm'} variant={'lighterror'} className="size-8! rounded-sm">
              <Trash2 className="size-5" />
            </Button>
          </div>
        );
      },
    },
  ];
};
