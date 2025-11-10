import { apiClient } from "@/config/api.config";

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    roles: string[];
    verified: boolean;
    avatar?: string;
  };
  tokens: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

class AuthService {
  async signUp(data: SignUpData) {
    const response = await apiClient.post("/v1/api/user/signup", data);
    return response;
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await apiClient.post<any>("/v1/api/user/signin", data);

    // Save token to localStorage
    if (response.metadata?.tokens?.accessToken) {
      localStorage.setItem("accessToken", response.metadata.tokens.accessToken);
    }

    return response.metadata;
  }

  async signOut(allDevices: boolean = false) {
    const response = await apiClient.post("/v1/api/user/signout", {
      allDevices,
    });
    localStorage.removeItem("accessToken");
    return response;
  }

  async forgotPassword(email: string) {
    return await apiClient.post("/v1/api/user/forgot-password", { email });
  }

  async verifyEmail(token: string) {
    return await apiClient.get(`/v1/api/user/verify-email?token=${token}`);
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ) {
    return await apiClient.post("/v1/api/user/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
  }

  async googleLogin(idToken: string) {
    const response = await apiClient.post<any>("/v1/api/user/google", {
      idToken,
    });

    if (response.metadata?.tokens?.accessToken) {
      localStorage.setItem("accessToken", response.metadata.tokens.accessToken);
    }

    return response.metadata;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
