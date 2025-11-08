"use client";

import type { Column, Table } from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Cross2Icon,
  DownloadIcon,
  PlusIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  onExport?: (data: TData[]) => void;
  onImport?: () => void;
  onAdd?: () => void;
  onAddText?: string;
  onBack?: () => void;
  onBackText?: string;
  ImportModalComponent?: React.ComponentType<any>;
  ExportModalComponent?: React.ComponentType<any>;
  importModalProps?: Record<string, any>;
  exportModalProps?: Record<string, any>;
  leftChildren?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  onExport,
  onImport,
  onAdd,
  onAddText,
  ImportModalComponent,
  ExportModalComponent,
  importModalProps,
  exportModalProps,
  leftChildren,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  const handleExport = React.useCallback(() => {
    if (ExportModalComponent) {
      setIsExportModalOpen(true);
    } else if (onExport) {
      const data = table.getFilteredRowModel().rows.map((row) => row.original);
      onExport(data);
    }
  }, [table, onExport, ExportModalComponent]);

  const handleImport = React.useCallback(() => {
    if (ImportModalComponent) {
      setIsImportModalOpen(true);
    } else if (onImport) {
      onImport();
    }
  }, [onImport, ImportModalComponent]);

  return (
    <>
      <div
        role="toolbar"
        aria-orientation="horizontal"
        className={cn(
          "flex w-full items-start justify-between gap-2",
          className
        )}
        {...props}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {leftChildren}
          {columns.map((column) => (
            <DataTableToolbarFilter key={column.id} column={column} />
          ))}
          {isFiltered && (
            <Button
              aria-label="Đặt lại bộ lọc"
              variant="outline"
              size="sm"
              className="border-dashed"
              onClick={onReset}
              cursor
            >
              <Cross2Icon />
              Đặt lại
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(onExport ?? ExportModalComponent) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8"
              cursor
            >
              <UploadIcon />
              Xuất
            </Button>
          )}
          {(onImport ?? ImportModalComponent) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="h-8"
              cursor
            >
              <DownloadIcon />
              Nhập
            </Button>
          )}
          {onAdd && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="text-white bg-primary hover:bg-primary/90"
              cursor
            >
              <PlusIcon />
              {onAddText}
            </Button>
          )}
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Render Import Modal */}
      {ImportModalComponent && (
        <ImportModalComponent
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          {...importModalProps}
        />
      )}

      {/* Render Export Modal */}
      {ExportModalComponent && (
        <ExportModalComponent
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          {...exportModalProps}
        />
      )}
    </>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;
    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) {
        return null;
      }

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 w-40 lg:w-56"
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            // <DataTableSliderFilter
            //   column={column}
            //   title={columnMeta.label ?? column.id}
            // />
            <div>
              <p>Range</p>
            </div>
          );

       // case "date":
        // case "dateRange":
        //   return (
        //     <DataTableDateFilter
        //       column={column}
        //       title={columnMeta.label ?? column.id}
        //       multiple={columnMeta.variant === "dateRange"}
        //     />
        //   );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
