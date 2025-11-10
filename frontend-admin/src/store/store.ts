import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/auth-api";
import { lessonApi } from "./api/lesson-api";
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware).concat(lessonApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
