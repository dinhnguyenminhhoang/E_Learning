"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableBasic } from "@/hooks/use-data-table-basic";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useCallback } from "react";

interface LessonTableParams<TData extends Record<string, unknown>> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, unknown>[];
  onAdd?: () => void;
}

export function LessonTable<TData extends Record<string, unknown>>({
  data,
  totalItems,
  columns,
  onAdd,
}: LessonTableParams<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const pageCount = Math.ceil(totalItems / pageSize);

  const createQueryString = useCallback(
    (params: Record<string, string | number>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      return newSearchParams.toString();
    },
    [searchParams],
  );

  const { table } = useDataTableBasic({
    data,
    columns,
    pageCount,
    defaultPage: currentPage,
    defaultPageSize: pageSize,
    onPageChange: (page) => {
      router.push(`${pathname}?${createQueryString({ page })}`, { scroll: false });
    },
    onPageSizeChange: (size) => {
      router.push(`${pathname}?${createQueryString({ pageSize: size, page: 1 })}`, { scroll: false });
    },
  });

  return (
    <DataTable table={table} totalRecords={totalItems}>
      <DataTableToolbar table={table} onAdd={onAdd} onAddText="Thêm mới" />
    </DataTable>
  );
}
