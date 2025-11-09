"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useGetAllLessonQuery } from "@/store/api/lesson-api";
import { LessonListingContent } from "./lesson-listing-content";
import { createColumns } from "./table/columns";
import { Lesson } from "@/types/response/lesson";
import { LessonModal } from "./modal/lesson-modal";
import { useGetCategoryQuery } from "@/store/api/category-api";

export default function LessonPage() {
  const searchParams = useSearchParams();

  const pageNum = Number(searchParams.get("pageNum") ?? 1);
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") ?? "";

  const queryArgs = React.useMemo(() => ({ pageNum, pageSize, search }), [pageNum, pageSize, search]);

  const { data, isLoading, error } = useGetAllLessonQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const { data: categories } = useGetCategoryQuery();

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);
  const [mode, setMode] = React.useState<"add" | "edit">("add");

  // Handler for row edit action
  const handleEdit = React.useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setMode("edit");
    setIsOpen(true);
  }, []);

  // Handler for add button
  const handleAdd = React.useCallback(() => {
    setSelectedLesson(null);
    setMode("add");
    setIsOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    if (mode === "edit") {
      setSelectedLesson(null);
    }
  }, [mode]);

  const columns = React.useMemo(() => createColumns(pageNum, pageSize, handleEdit), [pageNum, pageSize, handleEdit]);

  if (isLoading || categories) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi khi tải dữ liệu</p>;

  const lessons: Lesson[] = data?.data ?? [];
  const totalLessons: number = data?.pagination?.total ?? 0;

  return (
    <>
      <LessonListingContent
        key={`${pageNum}-${pageSize}-${totalLessons}`}
        employees={lessons}
        columns={columns}
        totalEmployees={totalLessons}
        onAdd={handleAdd}
      />

      <LessonModal
        isOpen={isOpen}
        onClose={handleClose}
        mode={mode}
        lesson={selectedLesson}
        categories={categories!.data ?? []}
      />
    </>
  );
}
