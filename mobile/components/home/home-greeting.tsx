import { Text, View } from "react-native";

import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";

export function HomeGreeting() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  const firstName =
    profile?.first_name?.trim() ||
    session?.user.email?.split("@")[0] ||
    "there";

  return (
    <View className="mb-3 px-5">
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        Hi {firstName}!
      </Text>
    </View>
  );
}
