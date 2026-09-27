import { Platform } from "react-native";

import { ensureUserProfile } from "@/lib/auth-service";
import { supabase } from "@/lib/supabase";

function parseAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = beforeHash.indexOf("?");
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";

  for (const segment of [hash, query]) {
    if (!segment) {
      continue;
    }

    for (const pair of segment.split("&")) {
      const [rawKey, rawValue] = pair.split("=");
      if (!rawKey || rawValue === undefined) {
        continue;
      }

      const key = decodeURIComponent(rawKey);
      const value = decodeURIComponent(rawValue);
      params[key] = value;
    }
  }

  return params;
}

export function getAuthCallbackUrlFromEnvironment(): string | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const href = window.location.href;
    if (isAuthCallbackUrl(href)) {
      return href;
    }
  }

  return null;
}

export function isAuthCallbackUrl(url: string): boolean {
  return (
    url.includes("auth/callback") ||
    url.includes("access_token=") ||
    url.includes("type=signup") ||
    url.includes("type=recovery") ||
    url.includes("type=email")
  );
}

export async function createSessionFromUrl(url: string): Promise<boolean> {
  const params = parseAuthParams(url);

  if (params.error_description) {
    throw new Error(params.error_description);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return false;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  await ensureUserProfile(data.user);

  return true;
}

export async function hasActiveSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}
