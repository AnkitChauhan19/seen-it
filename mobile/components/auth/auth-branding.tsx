import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function AuthBranding() {
  return (
    <View className="items-center px-6">
      <Text className="text-center text-5xl font-bold tracking-tight">
        <Text style={{ color: colors.text }}>Seen</Text>
        <Text style={{ color: colors.gold }}>It</Text>
      </Text>
      <Text
        className="mt-3 text-center text-lg font-medium"
        style={{ color: colors.text }}
      >
        Track everything you watch
      </Text>
      <Text className="mt-2 text-center text-sm" style={{ color: colors.textMuted }}>
        Movies • TV Shows • Anime • and more
      </Text>
    </View>
  );
}
