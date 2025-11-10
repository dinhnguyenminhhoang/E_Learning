import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQueryWithReauth } from "./base-api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (body) => ({
        url: "/user/signin",
        method: "POST",
        body,
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/user/refresh-token",
        method: "POST",
      }),
    }),
    me: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const { useSignInMutation, useMeQuery, useRefreshMutation } = authApi;
