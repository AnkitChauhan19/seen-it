import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function SearchPageHeader() {
  return (
    <View className="mb-4 px-5">
      <Text className="text-3xl font-bold" style={{ color: colors.text }}>
        Search
      </Text>
      <Text className="mt-1 text-base" style={{ color: colors.textMuted }}>
        Find movies, TV shows, anime and more
      </Text>
    </View>
  );
}
