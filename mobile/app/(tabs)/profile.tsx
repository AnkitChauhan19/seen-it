import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";

export default function ProfileScreen() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">Profile</Text>
      <Text className="mb-8 text-center text-slate-400">
        Account and settings will connect to Supabase Auth later.
      </Text>
      <Pressable
        className="rounded-xl border border-slate-700 px-6 py-3 active:bg-slate-900"
        onPress={() => {
          signOut();
          router.replace("/(auth)/login");
        }}
      >
        <Text className="text-base font-medium text-slate-200">Sign out</Text>
      </Pressable>
    </View>
  );
}
