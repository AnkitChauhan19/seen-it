import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { WatchlistPriority } from "@/components/watchlist/priority-badge";
import {
  WatchlistItemCard,
  type WatchlistItem,
} from "@/components/watchlist/watchlist-item-card";
import { colors } from "@/constants/theme";

type WatchlistContentProps = {
  items: WatchlistItem[];
  isLoading?: boolean;
  onRemove: (userMediaId: string) => void;
  onPriorityChange: (userMediaId: string, priority: WatchlistPriority) => void;
};

export function WatchlistContent({
  items,
  isLoading,
  onRemove,
  onPriorityChange,
}: WatchlistContentProps) {
  if (isLoading) {
    return (
      <View className="py-12">
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="items-center px-8 py-8">
        <View
          className="mb-4 h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceWarm }}
        >
          <Ionicons name="bookmark-outline" size={36} color={colors.gold} />
        </View>
        <Text
          className="mb-2 text-center text-lg font-semibold"
          style={{ color: colors.text }}
        >
          Nothing on your watchlist yet
        </Text>
        <Text
          className="mb-6 text-center text-sm"
          style={{ color: colors.textMuted }}
        >
          Search for titles and save them here to watch later.
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

  return (
    <View className="px-5 pt-1">
      {items.map((item) => (
        <WatchlistItemCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </View>
  );
}
