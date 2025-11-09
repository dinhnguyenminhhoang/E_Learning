"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Lesson } from "@/types/response/lesson";
import { CellAction } from "./action";
import { Text } from "lucide-react";
import { Category } from "@/types/response/category";

export const createColumns = (
  pageNum: number,
  pageSize: number,
  onEdit?: (data: Lesson) => void,
  onDelete?: (data: Lesson) => void,
): ColumnDef<Lesson>[] => [
  {
    id: "index",
    header: "STT",
    size: 60,
    cell: ({ row }) => <div className="text-center font-medium">{(pageNum - 1) * pageSize + row.index + 1}</div>,
    meta: { label: "STT" },
  },
  {
    id: "search",
    accessorKey: "title",
    header: "Tiêu đề bài học",
    cell: ({ cell }) => {
      const title = cell.getValue<string>() ?? "";
      const shortTitle = title.length > 40 ? title.slice(0, 40) + "..." : title;
      return (
        <div className="font-medium break-words whitespace-normal" title={title}>
          {shortTitle}
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    meta: {
      label: "Tiêu đề bài học",
      placeholder: "Tìm kiếm theo tiêu đề...",
      variant: "text",
      icon: Text as unknown as React.FC<React.SVGProps<SVGSVGElement>>,
    },
  },
  {
    id: "skill",
    accessorKey: "skill",
    header: "Kỹ năng",
    cell: ({ cell }) => <div className="text-left">{cell.getValue<string>()}</div>,
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Kỹ năng",
      placeholder: "Chọn kỹ năng",
      variant: "multiSelect",
    },
  },
  {
    id: "level",
    accessorKey: "level",
    header: "Trình độ",
    cell: ({ cell }) => <div className="text-left">{cell.getValue<string>()}</div>,
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Trình độ",
      placeholder: "Chọn trình độ",
      variant: "multiSelect",
    },
  },
  {
    id: "duration_minutes",
    accessorKey: "duration_minutes",
    header: "Thời lượng (phút)",
    cell: ({ cell }) => <div className="text-left">{cell.getValue<number>()}</div>,
    enableSorting: true,
    meta: { label: "Thời lượng" },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ cell }) => {
      const status = cell.getValue<string>() ?? "";
      const statusMap: Record<string, { label: string; className: string }> = {
        ACTIVE: {
          label: "Đang hoạt động",
          className: "bg-green-100 text-green-800 border-green-200 ",
        },
        INACTIVE: {
          label: "Ngưng hoạt động",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        },
        DRAFT: {
          label: "Bản nháp",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
      };

      const { label, className } = statusMap[status] ?? {
        label: "Không xác định",
        className: "bg-red-100 text-red-800 border-red-200",
      };

      return (
        <div className="flex justify-left ">
          <Badge variant="outline" className={`capitalize ${className}`}>
            {label}
          </Badge>
        </div>
      );
    },
    meta: { label: "Trạng thái" },
  },
  {
    id: "actions",
    header: "Thao tác",
    size: 100,
    cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} onDelete={onDelete} />,
    meta: { label: "Thao tác" },
  },
];

export const columns = createColumns(1, 10);
