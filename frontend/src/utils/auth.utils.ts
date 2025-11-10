import { UserRole } from "@/types/auth.types";

export const hasRole = (
  userRoles: UserRole[],
  requiredRoles: UserRole[]
): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role));
};

export const isAdmin = (userRoles: UserRole[]): boolean => {
  return userRoles.includes(UserRole.ADMIN);
};

export const canAccessAdminPanel = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
  ]);
};

export const getRedirectPath = (userRoles: UserRole[]): string => {
  if (canAccessAdminPanel(userRoles)) {
    return "/admin/dashboard";
  }

  return "/";
};

export const saveAuthData = (accessToken: string, user: any) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getStoredAuthData = () => {
  const accessToken = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return { accessToken, user };
};
