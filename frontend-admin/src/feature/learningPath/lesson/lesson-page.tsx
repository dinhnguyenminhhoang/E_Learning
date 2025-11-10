"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useGetAllLessonQuery } from "@/store/api/lesson-api";
import { LessonListingContent } from "./lesson-listing-content";
import { createColumns } from "./table/columns";
import { Lesson } from "@/types/response/lesson";

export default function LessonPage() {
  const searchParams = useSearchParams();
  // support both `pageNum` and legacy `page`
  const pageNum = Number(searchParams.get("pageNum") ?? searchParams.get("page") ?? 1) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") ?? "";

  // Memoize args so RTK Query sees a stable reference when values don't change
  const queryArgs = React.useMemo(() => ({ pageNum, pageSize, search }), [pageNum, pageSize, search]);

  const { data, isLoading, error } = useGetAllLessonQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const columns = createColumns(pageNum, pageSize);

  // Debug log to help diagnose rendering vs fetched data
  console.log("LessonPage - queryArgs:", queryArgs, "data:", data);

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi khi tải dữ liệu</p>;

  const lessons: Lesson[] = data?.data ?? [];
  const totalLessons: number = data?.pagination?.total ?? 0;

  return (
    <LessonListingContent
      key={`${pageNum}-${pageSize}-${totalLessons}`}
      employees={lessons}
      columns={columns}
      totalEmployees={totalLessons}
    />
  );
}
