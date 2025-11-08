"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { ExtendedColumnSort } from "@/types/data-table";

interface UseDataTableBasicProps<TData>
  extends Omit<
      TableOptions<TData>,
      "state" | "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
  defaultPage?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  debounceMs?: number;
}

export function useDataTableBasic<TData extends object>(props: UseDataTableBasicProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    defaultPage = 1,
    defaultPageSize = 10,
    onPageChange,
    onPageSizeChange,
    debounceMs = 300,
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const pagination = React.useMemo<PaginationState>(
    () => ({
      pageIndex: defaultPage - 1,
      pageSize: defaultPageSize,
    }),
    [defaultPage, defaultPageSize],
  );

  const debouncedOnPageChange = useDebouncedCallback((page: number) => onPageChange?.(page), debounceMs);
  const debouncedOnPageSizeChange = useDebouncedCallback((size: number) => onPageSizeChange?.(size), debounceMs);

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
      if (next.pageIndex + 1 !== pagination.pageIndex + 1) {
        debouncedOnPageChange?.(next.pageIndex + 1);
      }
      if (next.pageSize !== pagination.pageSize) {
        debouncedOnPageSizeChange?.(next.pageSize);
      }
    },
    [pagination, debouncedOnPageChange, debouncedOnPageSizeChange],
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table };
}
