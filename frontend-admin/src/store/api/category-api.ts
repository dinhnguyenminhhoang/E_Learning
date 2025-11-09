import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQueryWithReauth } from "./base-api";
import { BaseResponse } from "@/types/response/base-response";
import { Category } from "@/types/response/category";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategory: builder.query<BaseResponse<Category[]>, void>({
      query: () => {
        return {
          url: `/category`,
          method: "GET",
        };
      },
      providesTags: () => [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const { useGetCategoryQuery } = categoryApi;
