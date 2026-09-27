import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function LibraryPageHeader() {
  return (
    <View className="mb-1 flex-row items-start justify-between px-5">
      <View className="flex-1 pr-3">
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          My Library
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Everything you&apos;ve watched.
        </Text>
      </View>

      <Link href="/(tabs)/search" asChild>
        <Pressable
          className="flex-row items-center gap-1 rounded-full px-4 py-2.5"
          style={{ backgroundColor: colors.gold }}
        >
          <Ionicons name="add" size={18} color="#000000" />
          <Text className="text-sm font-bold text-black">Add</Text>
        </Pressable>
      </Link>
    </View>
  );
}
