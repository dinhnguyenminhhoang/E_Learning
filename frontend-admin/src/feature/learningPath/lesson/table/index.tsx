"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";

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
  const [pageNum, setPageNum] = useQueryState("pageNum", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const pageCount = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      pagination: { pageIndex: pageNum - 1, pageSize },
    },
    shallow: false,
    debounceMs: 0,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex: pageNum - 1, pageSize }) : updater;

      setPageNum(next.pageIndex + 1);
      setPageSize(next.pageSize);
    },
  });

  if (!pageSize) return null;
    console.log("ok1");

  return (
    <DataTable table={table} totalRecords={totalItems}>
      <DataTableToolbar table={table} onAdd={onAdd} onAddText="Thêm mới" />
    </DataTable>
  );
}
