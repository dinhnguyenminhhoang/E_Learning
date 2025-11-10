import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

export const customBaseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getCookie("access_token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // ✅ Token hết hạn
  if (result.error && result.error.status === 401) {
    if (isRefreshing) {
      // Nếu đang refresh, chờ refresh xong
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => baseQuery(args, api, extraOptions))
        .catch((err) => ({ error: err }));
    }

    isRefreshing = true;
    try {
      const refreshResult = await baseQuery(
        { url: "/user/refresh-token", method: "POST" },
        api,
        extraOptions
      );

      const newAccessToken = (refreshResult.data as any)?.metadata?.accessToken;

      if (newAccessToken) {
        // 🔹 Lưu lại token mới vào cookie
        setCookie("access_token", newAccessToken);
        processQueue(null, newAccessToken);

        // 🔹 Gọi lại request cũ
        result = await baseQuery(args, api, extraOptions);
      } else {
        throw new Error("Refresh token failed");
      }
    } catch (err) {
      processQueue(err);
      removeCookie("access_token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
    } finally {
      isRefreshing = false;
    }
  }

  return result;
};
