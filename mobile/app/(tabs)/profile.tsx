import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signOut } from "@/lib/auth-service";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";

export default function ProfileScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : session?.user.email?.split("@")[0] ?? "User";

  const initials = profile
    ? `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase()
    : session?.user.email?.[0]?.toUpperCase() ?? "?";

  const email = session?.user.email ?? profile?.email ?? "";

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 px-5"
      edges={["top", "bottom"]}
      style={{ backgroundColor: colors.background }}
    >
      <Text className="pt-4 text-3xl font-bold" style={{ color: colors.text }}>
        Profile
      </Text>

      <View className="mt-8 flex-row items-stretch gap-4">
        <View
          className="min-w-[72px] items-center justify-center rounded-2xl px-3"
          style={{ backgroundColor: colors.gold }}
        >
          <Text className="text-2xl font-bold text-black">{initials}</Text>
        </View>

        <View className="flex-1 justify-center py-0.5">
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            {fullName}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            {email}
          </Text>
        </View>
      </View>

      {error ? (
        <Text className="mt-4 text-sm" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}

      <View className="flex-1" />

      <Pressable
        className="mb-2 self-start rounded-full px-6 py-3 active:opacity-90 disabled:opacity-60"
        style={{
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        disabled={isSigningOut}
        onPress={() => void handleSignOut()}
      >
        {isSigningOut ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Sign out
          </Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
