import type { ModuleResponse } from '../../types';
import { Button } from '@/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

interface ModuleTableProps {
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const getModuleColumns = ({
  onUpdate,
  onDelete,
}: ModuleTableProps): ColumnDef<ModuleResponse>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { name } = row.original;
        return <span className="font-medium">{name}</span>;
      },
    },
    {
      accessorKey: 'key',
      header: 'Key',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'action',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onUpdate(id)}
              size={'sm'}
              variant={'lightprimary'}
              className="size-8! rounded-sm"
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              onClick={() => onDelete(id)}
              size={'sm'}
              variant={'lighterror'}
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

// Keep backward compatibility
export const moduleColumns: ColumnDef<ModuleResponse>[] = getModuleColumns({
  onUpdate: () => {},
  onDelete: () => {},
});
