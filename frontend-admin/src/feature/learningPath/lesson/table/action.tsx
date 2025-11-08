"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconEdit, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CellActionProps {
  data: any;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onAssignPosition?: (row: any) => void;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  onEdit,
  onDelete,
  onAssignPosition,
}) => {
  const handleAssignPosition = () => {
    toast.warning("Chức năng này đang được phát triển, vui lòng quay lại sau!");
    onAssignPosition?.(data);
  };

  const handleEdit = () => {
    toast.warning("Chức năng này đang được phát triển, vui lòng quay lại sau!");
    onEdit?.(data);
  };

  const handleDelete = () => {
    toast.warning("Chức năng này đang được phát triển, vui lòng quay lại sau!");
    onDelete?.(data);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
          <span className="sr-only">Open menu</span>
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleAssignPosition}>
          <UserPlus className="mr-2 h-4 w-4" /> Gắn vị trí
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <IconEdit className="mr-2 h-4 w-4" /> Cập nhật
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>
          <IconTrash className="mr-2 h-4 w-4" /> Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
