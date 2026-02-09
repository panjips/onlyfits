import type { OrganizationResponse } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

interface OrganizationTableProps {
    onUpdate: (id: string) => void,
    onDelete: (id: string) => void,
}

export const getColumns = ({onUpdate, onDelete}: OrganizationTableProps): ColumnDef<OrganizationResponse>[] => { 
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { name, logoUrl } = row.original;
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={logoUrl || ''} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      id: 'action',
      header: 'Action',
      enableSorting: false,
      cell: ({row}) => {
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