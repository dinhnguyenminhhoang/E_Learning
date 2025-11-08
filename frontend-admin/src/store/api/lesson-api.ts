import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQueryWithReauth } from "./base-api";
import { Lesson } from "@/types/response/lesson";
import { PaginatedResponse } from "@/types/response/base-response";

export const lessonApi = createApi({
  reducerPath: "lessonApi",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["Lesson"],
  endpoints: (builder) => ({
    getAllLesson: builder.query<
      PaginatedResponse<Lesson>,
      {
        pageNum?: number;
        pageSize?: number;
        skill?: string;
        level?: string;
        categoryId?: string;
        search?: string;
      }
    >({
      query: ({ pageNum = 1, pageSize = 10, skill, level, categoryId, search }) => {
        const params = new URLSearchParams();

        params.append("pageNum", pageNum.toString());
        params.append("pageSize", pageSize.toString());
        if (skill) params.append("skill", skill);
        if (level) params.append("level", level);
        if (categoryId) params.append("categoryId", categoryId);
        if (search) params.append("search", search);

        return {
          url: `/lesson?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Lesson"],
    }),
  }),
});

export const { useGetAllLessonQuery } = lessonApi;
