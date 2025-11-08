
"use client"

import { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import dayjs from "dayjs";
import { Checkbox } from "@/components/ui/checkbox";
import type { Option } from "@/types/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { CellAction } from "./action";

export const createColumns = (
  pageNum: number,
  pageSize: number,
  positionOptions: Option[] = [],
  departmentOptions: Option[] = []
): ColumnDef<any>[] => [
  {
    id: "index",
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    size: 60,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {(pageNum - 1) * pageSize + row.index + 1}
      </div>
    ),
    meta: { label: "STT" },
  },
  {
    id: "employeeCode",
    accessorKey: "employeeCode",
    enableSorting: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="MÃ NHÂN VIÊN" />
    ),
    size: 140,
    cell: ({ cell }) => {
      const employeeCode =
        cell.getValue<any["employeeCode"]>() ?? "";
      return (
        <div
          className="truncate whitespace-nowrap overflow-hidden font-medium"
          title={employeeCode}
        >
          {employeeCode}
        </div>
      );
    },
    meta: { label: "Mã nhân viên" },
  },
  {
    id: "fullName",
    accessorKey: "fullName",
    enableSorting: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="HỌ VÀ TÊN" />
    ),
    size: 200,
    cell: ({ cell }) => {
      const fullName = cell.getValue<any["fullName"]>() ?? "";
      const shortName =
        fullName.length > 30 ? fullName.slice(0, 30) + "..." : fullName;
      return (
        <div
          className="truncate whitespace-nowrap overflow-hidden font-medium"
          title={fullName}
        >
          {shortName}
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: "Họ và tên",
      placeholder: "Tìm kiếm theo tên, chức vụ...",
      variant: "text",
      icon: Text as unknown as React.FC<React.SVGProps<SVGSVGElement>>,
    },
  },
  {
    id: "position",
    accessorKey: "position.title",
    enableSorting: true,
    enableColumnFilter: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="TÊN CHỨC VỤ" />
    ),
    size: 180,
    cell: ({ cell }) => {
      const positionTitle = cell.getValue<string>() || "Chưa có chức vụ";
      return (
        <div className="truncate whitespace-nowrap overflow-hidden">
          {positionTitle}
        </div>
      );
    },
    meta: {
      label: "Chức vụ",
      variant: "select",
      options: positionOptions,
    },
  },
  {
    id: "department",
    accessorKey: "department.name",
    enableSorting: true,
    enableColumnFilter: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="TÊN PHÒNG BAN" />
    ),
    size: 180,
    cell: ({ cell }) => {
      const departmentName = cell.getValue<string>() || "Chưa có phòng ban";
      return (
        <div className="truncate whitespace-nowrap overflow-hidden">
          {departmentName}
        </div>
      );
    },
    meta: {
      label: "Phòng ban",
      variant: "select",
      options: departmentOptions,
    },
  },
  {
    id: "managerName",
    accessorKey: "managerName",
    enableSorting: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="QUẢN LÝ" />
    ),
    size: 160,
    cell: ({ cell }) => {
      const managerName =
        cell.getValue<any["managerName"]>() ??
        "Chưa có quản lý";
      return (
        <div className="truncate whitespace-nowrap overflow-hidden text-gray-700">
          {managerName}
        </div>
      );
    },
    meta: { label: "Quản lý" },
  },
  {
    id: "isProbation",
    accessorKey: "isProbation",
    enableSorting: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="THỬ VIỆC" />
    ),
    size: 100,
    cell: ({ cell }) => {
      const isProbation = cell.getValue<any["isProbation"]>();
      return (
        <div className="flex justify-left pl-5">
          <Checkbox
            checked={isProbation}
            disabled
            className="pointer-events-none"
          />
        </div>
      );
    },
    meta: { label: "Thử việc" },
  },
  {
    id: "startDate",
    accessorKey: "startDate",
    enableSorting: true,
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="NGÀY BẮT ĐẦU" />
    ),
    size: 140,
    cell: ({ cell }) => {
      const startDate = cell.getValue<any["startDate"]>();
      return (
        <div className="text-center text-gray-700">
          {startDate ? dayjs(startDate).format("DD/MM/YYYY") : "Chưa có"}
        </div>
      );
    },
    meta: { label: "Ngày bắt đầu" },
  },
  {
    id: "actions",
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title="THAO TÁC" />
    ),
    cell: ({ row }) => <CellAction data={row.original} />,
    size: 80,
    meta: { label: "Thao tác" },
  },
];

export const columns = createColumns(1, 10);
