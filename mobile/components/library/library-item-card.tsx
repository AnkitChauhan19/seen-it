import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { LibraryFilter } from "@/components/library/library-filter-chips";
import { AppActionSheet } from "@/components/ui/app-action-sheet";
import type { LibraryListItem } from "@/lib/user-media-mappers";
import { LIBRARY_CATEGORY_LABELS } from "@/types/user-media";
import { colors } from "@/constants/theme";

type LibraryItemCardProps = {
  item: LibraryListItem;
  libraryFilter: LibraryFilter;
  onRemoveTheater: (userMediaId: string) => void;
  onRemoveShelf: (userMediaId: string) => void;
  onRemoveAll: (userMediaId: string) => void;
  compact?: boolean;
};

export function LibraryItemCard({
  item,
  libraryFilter,
  onRemoveTheater,
  onRemoveShelf,
  onRemoveAll,
  compact,
}: LibraryItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const removeOptions = useMemo(() => {
    const options: {
      key: string;
      label: string;
      destructive?: boolean;
      onPress: () => void;
    }[] = [];

    if (libraryFilter === "Theaters") {
      options.push({
        key: "theater",
        label: "Remove from theaters",
        destructive: true,
        onPress: () => onRemoveTheater(item.userMediaId),
      });
      return options;
    }

    if (libraryFilter !== "All") {
      options.push({
        key: "shelf",
        label: "Remove from library",
        destructive: true,
        onPress: () => onRemoveShelf(item.userMediaId),
      });
      return options;
    }

    if (item.inTheaters) {
      options.push({
        key: "theater",
        label: `Remove from ${LIBRARY_CATEGORY_LABELS.theaters}`,
        destructive: true,
        onPress: () => onRemoveTheater(item.userMediaId),
      });
    }
    if (item.libraryCategory) {
      options.push({
        key: "shelf",
        label: `Remove from ${LIBRARY_CATEGORY_LABELS[item.libraryCategory]}`,
        destructive: true,
        onPress: () => onRemoveShelf(item.userMediaId),
      });
    }
    if (options.length > 1) {
      options.push({
        key: "all",
        label: "Remove from all shelves",
        destructive: true,
        onPress: () => onRemoveAll(item.userMediaId),
      });
    }

    return options;
  }, [
    item,
    libraryFilter,
    onRemoveAll,
    onRemoveShelf,
    onRemoveTheater,
  ]);

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
        {item.theaterLine ? (
          <Text
            className="mt-1 text-xs"
            style={{ color: colors.textMuted }}
            numberOfLines={2}
          >
            {item.theaterLine}
          </Text>
        ) : null}
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
        options={removeOptions.map((opt) => ({
          ...opt,
          onPress: () => {
            setMenuOpen(false);
            opt.onPress();
          },
        }))}
      />
    </>
  );
}
