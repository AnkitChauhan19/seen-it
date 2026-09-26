import { Redirect, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signInDev = useAuthStore((state) => state.signInDev);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-4xl font-bold tracking-tight text-white">
        SeenIt
      </Text>
      <Text className="mb-10 text-center text-base text-slate-400">
        Track everything you watch — movies, series, anime, and more.
      </Text>
      <Pressable
        className="rounded-xl bg-sky-500 px-8 py-3 active:bg-sky-600"
        onPress={() => {
          signInDev();
          router.replace("/(tabs)/home");
        }}
      >
        <Text className="text-base font-semibold text-white">
          Continue (dev)
        </Text>
      </Pressable>
      <Text className="mt-4 text-center text-xs text-slate-500">
        Supabase auth will replace this temporary entry point.
      </Text>
    </View>
  );
}
