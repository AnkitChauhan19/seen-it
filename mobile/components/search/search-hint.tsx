import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function SearchHint() {
  return (
    <View className="mb-4 px-5">
      <Text className="text-sm" style={{ color: colors.textSubtle }}>
        Try &quot;Dune&quot;, &quot;One Piece&quot;, &quot;Breaking Bad&quot;...
      </Text>
    </View>
  );
}
