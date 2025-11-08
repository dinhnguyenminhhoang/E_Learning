"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LessonTable } from "./table";

export function LessonListingContent({
  employees,
  totalEmployees,
  columns,
  onAdd,
}: {
  employees: any[];
  totalEmployees: number;
  columns: ColumnDef<any, any>[];
  onTableStateChange?: (state: { sorting: any; filters: any }) => void;
  onAdd?: () => void;
}) {
  return (
    <div className="space-y-4">
      <LessonTable data={employees} totalItems={totalEmployees} columns={columns} onAdd={onAdd} />
    </div>
  );
}
