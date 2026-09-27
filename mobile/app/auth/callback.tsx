import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  createSessionFromUrl,
  getAuthCallbackUrlFromEnvironment,
  hasActiveSession,
  isAuthCallbackUrl,
} from "@/lib/auth-deep-link";
import { useAuthStore } from "@/store/auth-store";

type CallbackStatus = "loading" | "success" | "error" | "manual";

const screenStyle = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});

export default function AuthCallbackScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url || !isAuthCallbackUrl(url)) {
        const hasSession = await hasActiveSession();
        if (hasSession) {
          setStatus("success");
          return;
        }
        setStatus("manual");
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const handled = await createSessionFromUrl(url);
        if (handled) {
          setStatus("success");
          return;
        }

        const hasSession = await hasActiveSession();
        if (hasSession) {
          setStatus("success");
          return;
        }

        setError("Verification link is missing session details.");
        setStatus("error");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Email verification failed.",
        );
        setStatus("error");
      }
    };

    const webUrl = getAuthCallbackUrlFromEnvironment();
    if (webUrl) {
      void processUrl(webUrl);
      return;
    }

    void Linking.getInitialURL().then((url) => processUrl(url));

    if (linkingUrl) {
      void processUrl(linkingUrl);
    }
  }, [linkingUrl]);

  useEffect(() => {
    if (isAuthenticated || status === "success") {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, status, router]);

  if (isAuthenticated || status === "success") {
    return (
      <View style={screenStyle.root}>
        <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
          Email confirmed
        </Text>
        <Text
          style={{
            color: "#a3a3a3",
            fontSize: 15,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {Platform.OS === "web"
            ? "You can close this tab and return to the SeenIt app."
            : "Opening SeenIt..."}
        </Text>
        <ActivityIndicator color="#ffffff" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={screenStyle.root}>
        <Text style={{ color: "#f87171", fontSize: 16, textAlign: "center" }}>
          {error}
        </Text>
        <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 20 }}>
          <Text style={{ color: "#60a5fa", fontSize: 15, fontWeight: "600" }}>
            Go to Sign in
          </Text>
        </Pressable>
      </View>
    );
  }

  if (status === "loading") {
    return (
      <View style={screenStyle.root}>
        <ActivityIndicator color="#ffffff" size="large" />
        <Text style={{ color: "#a3a3a3", fontSize: 14, marginTop: 16 }}>
          Confirming your email...
        </Text>
      </View>
    );
  }

  return (
    <View style={screenStyle.root}>
      <Text style={{ color: "#d4d4d4", fontSize: 16, textAlign: "center" }}>
        Email verified. Open SeenIt on this phone and sign in.
      </Text>
      <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 20 }}>
        <Text style={{ color: "#60a5fa", fontSize: 15, fontWeight: "600" }}>
          Go to Sign in
        </Text>
      </Pressable>
    </View>
  );
}
