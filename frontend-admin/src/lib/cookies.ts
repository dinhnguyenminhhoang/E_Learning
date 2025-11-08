"use client";

import Cookies from "js-cookie";

export const setCookie = (key: string, value: string, days = 7) => {
  Cookies.set(key, value, { expires: days, sameSite: "Lax" });
};

export const getCookie = (key: string): string | null => {
  return Cookies.get(key) ?? null;
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};
