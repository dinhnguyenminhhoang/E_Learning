import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/auth-api";
import { lessonApi } from "./api/lesson-api";
import { categoryApi } from "./api/category-api";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware).concat(lessonApi.middleware).concat(categoryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
