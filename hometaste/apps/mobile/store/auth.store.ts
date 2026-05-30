import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { API_URL } from "../services/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "COOK" | "ADMIN";
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  async setSession(user, accessToken, refreshToken) {
    await SecureStore.setItemAsync("ht_access_token", accessToken);
    await SecureStore.setItemAsync("ht_refresh_token", refreshToken);
    set({ user, accessToken, refreshToken });
  },
  async refreshTokens() {
    const storedRefreshToken = await SecureStore.getItemAsync("ht_refresh_token");
    if (!storedRefreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken })
    });
    const data = (await response.json().catch(() => ({}))) as { accessToken?: string; refreshToken?: string; error?: string };
    if (!response.ok || !data.accessToken || !data.refreshToken) throw new Error(data.error ?? "Unable to refresh session");

    await SecureStore.setItemAsync("ht_access_token", data.accessToken);
    await SecureStore.setItemAsync("ht_refresh_token", data.refreshToken);
    set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  },
  async clearSession() {
    await SecureStore.deleteItemAsync("ht_access_token");
    await SecureStore.deleteItemAsync("ht_refresh_token");
    set({ user: null, accessToken: null, refreshToken: null });
  }
}));
