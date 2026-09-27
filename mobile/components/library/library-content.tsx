import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { LibraryItemCard } from "@/components/library/library-item-card";
import type { LibraryViewMode } from "@/components/library/library-toolbar";
import type { LibraryListItem } from "@/lib/user-media-mappers";
import { colors } from "@/constants/theme";

type LibraryContentProps = {
  viewMode: LibraryViewMode;
  items: LibraryListItem[];
  isLoading?: boolean;
  onRemove: (userMediaId: string) => void;
};

export function LibraryContent({
  viewMode,
  items,
  isLoading,
  onRemove,
}: LibraryContentProps) {
  if (isLoading) {
    return (
      <View className="py-12">
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="items-center px-8 py-10">
        <View
          className="mb-4 h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceWarm }}
        >
          <Ionicons name="albums-outline" size={36} color={colors.gold} />
        </View>
        <Text
          className="mb-2 text-center text-lg font-semibold"
          style={{ color: colors.text }}
        >
          Your library is empty
        </Text>
        <Text className="mb-6 text-center text-sm" style={{ color: colors.textMuted }}>
          Add movies and shows you have watched to see them here.
        </Text>
        <Link href="/(tabs)/search" asChild>
          <Pressable
            className="rounded-full px-6 py-3"
            style={{ backgroundColor: colors.gold }}
          >
            <Text className="font-bold text-black">Search & Add</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (viewMode === "grid") {
    return (
      <View className="flex-row flex-wrap gap-3 px-5">
        {items.map((item) => (
          <View key={item.id} className="w-full">
            <LibraryItemCard item={item} onRemove={onRemove} compact />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="px-5">
      {items.map((item) => (
        <LibraryItemCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </View>
  );
}
