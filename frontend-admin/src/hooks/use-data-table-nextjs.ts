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

interface UseDataTableNextJSProps<TData>
  extends Omit<
      TableOptions<TData>,
      "state" | "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & { sorting?: ExtendedColumnSort<TData>[] };
  defaultPage?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  debounceMs?: number;
}

export function useDataTableNextJS<TData extends object>(props: UseDataTableNextJSProps<TData>) {
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
    () => ({ pageIndex: defaultPage - 1, pageSize: defaultPageSize }),
    [defaultPage, defaultPageSize],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      onPageChange?.(page);
    },
    [onPageChange],
  );

  const handlePageSizeChange = React.useCallback(
    (size: number) => {
      onPageSizeChange?.(size);
    },
    [onPageSizeChange],
  );

  const debouncedPageChange = useDebouncedCallback(handlePageChange, debounceMs);
  const debouncedPageSizeChange = useDebouncedCallback(handlePageSizeChange, debounceMs);

  const onPaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      if (next.pageIndex + 1 !== pagination.pageIndex + 1) {
        debouncedPageChange(next.pageIndex + 1);
      }
      if (next.pageSize !== pagination.pageSize) {
        debouncedPageSizeChange(next.pageSize);
      }
    },
    [pagination, debouncedPageChange, debouncedPageSizeChange],
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: { pagination, sorting, columnVisibility, rowSelection, columnFilters },
    defaultColumn: { ...tableProps.defaultColumn, enableColumnFilter: false },
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
