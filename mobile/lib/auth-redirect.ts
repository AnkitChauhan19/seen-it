import * as Linking from "expo-linking";

/**
 * Deep link Supabase should redirect to after email verification.
 * Use the app scheme so the OS opens SeenIt/Expo Go instead of a blank browser tab.
 */
export function getAuthRedirectUrl(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (override) {
    return override;
  }

  return Linking.createURL("/auth/callback", { scheme: "seenit" });
}
