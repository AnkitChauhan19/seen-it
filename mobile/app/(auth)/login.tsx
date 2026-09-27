import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthField } from "@/components/auth/auth-field";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { colors } from "@/constants/theme";
import { signInWithEmail } from "@/lib/auth-service";
import { useAuthStore } from "@/store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmail({ email, password });
      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell>
      <Text className="mb-6 text-2xl font-bold" style={{ color: colors.text }}>
        Sign in
      </Text>

      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <AuthField
        autoCapitalize="none"
        autoComplete="password"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <Text className="mb-2 text-center text-sm text-red-400">{error}</Text>
      ) : null}

      <Pressable
        className="mt-1 rounded-full py-4 active:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: colors.gold }}
        disabled={isSubmitting}
        onPress={() => void handleSignIn()}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text className="text-center text-base font-bold text-black">
            SIGN IN
          </Text>
        )}
      </Pressable>

      <AuthDivider />

      <View className="flex-row flex-wrap items-center justify-center">
        <Text className="text-sm text-neutral-400">
          Don&apos;t have an account?{" "}
        </Text>
        <Link href="./signup" asChild>
          <Pressable>
            <Text className="text-sm font-medium" style={{ color: colors.link }}>
              Sign Up
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
