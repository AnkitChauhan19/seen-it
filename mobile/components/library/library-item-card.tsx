import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppActionSheet } from "@/components/ui/app-action-sheet";
import type { LibraryListItem } from "@/lib/user-media-mappers";
import { colors } from "@/constants/theme";

type LibraryItemCardProps = {
  item: LibraryListItem;
  onRemove: (userMediaId: string) => void;
  compact?: boolean;
};

export function LibraryItemCard({
  item,
  onRemove,
  compact,
}: LibraryItemCardProps) {
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
          <Pressable hitSlop={8} onPress={() => setMenuOpen(true)}>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        <Text className="mt-1.5 text-xs" style={{ color: colors.textMuted }}>
          {item.year} • {item.type}
        </Text>
        {!compact ? (
          <Text
            className="mt-2.5 text-sm leading-5"
            style={{ color: colors.textMuted }}
            numberOfLines={2}
          >
            {item.synopsis}
          </Text>
        ) : null}
      </View>

      <AppActionSheet
        visible={menuOpen}
        title={item.title}
        onClose={() => setMenuOpen(false)}
        options={[
          {
            key: "remove",
            label: "Remove from library",
            destructive: true,
            onPress: () => onRemove(item.userMediaId),
          },
        ]}
      />
    </>
  );
}
