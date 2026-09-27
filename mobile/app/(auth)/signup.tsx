import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { AppNoticeDialog } from "@/components/ui/app-notice-dialog";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthField } from "@/components/auth/auth-field";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { colors } from "@/constants/theme";
import { signUpWithEmail } from "@/lib/auth-service";
import { useAuthStore } from "@/store/auth-store";

export default function SignUpScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEmailNotice, setConfirmEmailNotice] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleSignUp = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signUpWithEmail({
        firstName,
        lastName,
        email,
        password,
      });

      if (result.needsEmailConfirmation) {
        setConfirmEmailNotice(true);
        return;
      }

      router.replace("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell>
      <Text className="mb-6 text-2xl font-bold" style={{ color: colors.text }}>
        Sign Up
      </Text>

      <AuthField
        autoCapitalize="words"
        autoComplete="given-name"
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <AuthField
        autoCapitalize="words"
        autoComplete="family-name"
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
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
        autoComplete="password-new"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text className="mb-2 text-xs text-neutral-500">
        Use a @gmail.com address. Password needs 8+ characters with upper,
        lower, number, and special character.
      </Text>

      {error ? (
        <Text className="mb-2 text-center text-sm text-red-400">{error}</Text>
      ) : null}
      <Pressable
        className="mt-1 rounded-full py-4 active:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: colors.gold }}
        disabled={isSubmitting}
        onPress={() => void handleSignUp()}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text className="text-center text-base font-bold text-black">
            SIGN UP
          </Text>
        )}
      </Pressable>

      <AuthDivider />

      <View className="flex-row flex-wrap items-center justify-center">
        <Text className="text-sm text-neutral-400">Already a user? </Text>
        <Link href="./login" asChild>
          <Pressable>
            <Text className="text-sm font-medium" style={{ color: colors.link }}>
              Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
      <AppNoticeDialog
        visible={confirmEmailNotice}
        title="Confirm your email"
        message="We sent a link to your Gmail. Your account is not active until you confirm. Then sign in."
        confirmLabel="Go to sign in"
        onConfirm={() => router.replace("./login")}
        onClose={() => {
          setConfirmEmailNotice(false);
          router.replace("./login");
        }}
      />
    </AuthScreenShell>
  );
}
