import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  PriorityBadge,
  type WatchlistPriority,
} from "@/components/watchlist/priority-badge";
import { AppActionSheet } from "@/components/ui/app-action-sheet";
import { colors } from "@/constants/theme";

export type WatchlistItem = {
  id: string;
  userMediaId: string;
  mediaCompositeId: string;
  title: string;
  year: string;
  type: string;
  mediaKind?: "movie" | "tv" | "anime";
  genres: string;
  synopsis: string;
  posterPath?: string;
  priority: WatchlistPriority;
};

type WatchlistItemCardProps = {
  item: WatchlistItem;
  onRemove: (userMediaId: string) => void;
  onPriorityChange: (userMediaId: string, priority: WatchlistPriority) => void;
};

export function WatchlistItemCard({
  item,
  onRemove,
  onPriorityChange,
}: WatchlistItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View
        className="mb-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 text-lg font-bold leading-6"
            style={{ color: colors.text }}
          >
            {item.title}
          </Text>

          <View className="flex-row items-center gap-3">
            <Pressable
              hitSlop={8}
              onPress={() => onRemove(item.userMediaId)}
              accessibilityLabel="Remove from watchlist"
            >
              <Ionicons name="bookmark" size={20} color={colors.gold} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => setMenuOpen(true)}>
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        <Text className="mt-1.5 text-xs" style={{ color: colors.textMuted }}>
          {item.year} • {item.type}
        </Text>
        {item.genres ? (
          <Text className="mt-1 text-xs" style={{ color: colors.textSubtle }}>
            {item.genres}
          </Text>
        ) : null}
        <Text
          className="mt-2.5 text-sm leading-5"
          style={{ color: colors.textMuted }}
          numberOfLines={2}
        >
          {item.synopsis}
        </Text>
        <View className="mt-3">
          <PriorityBadge priority={item.priority} />
        </View>
      </View>

      <AppActionSheet
        visible={menuOpen}
        title={item.title}
        message="Watchlist options"
        onClose={() => setMenuOpen(false)}
        options={[
          {
            key: "high",
            label: "Set high priority",
            onPress: () => onPriorityChange(item.userMediaId, "high"),
          },
          {
            key: "medium",
            label: "Set medium priority",
            onPress: () => onPriorityChange(item.userMediaId, "medium"),
          },
          {
            key: "low",
            label: "Set low priority",
            onPress: () => onPriorityChange(item.userMediaId, "low"),
          },
          {
            key: "remove",
            label: "Remove from watchlist",
            destructive: true,
            onPress: () => onRemove(item.userMediaId),
          },
        ]}
      />
    </>
  );
}
