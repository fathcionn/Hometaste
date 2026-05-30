import * as SecureStore from "expo-secure-store";

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4173";

export interface ApiOptions extends RequestInit {
  auth?: boolean;
}

/**
 * Sends a typed API request to the HomeTaste backend.
 */
export async function apiRequest<TResponse>(path: string, options: ApiOptions = {}): Promise<TResponse> {
  const token = options.auth ? await SecureStore.getItemAsync("ht_access_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = (await response.json().catch(() => ({}))) as TResponse | { error?: string };
  const maybeError = data as { error?: string };
  if (!response.ok) throw new Error(maybeError.error ?? "Request failed");
  return data as TResponse;
}
