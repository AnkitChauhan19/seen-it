import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { LibrarySortOption } from "@/lib/library-sort";
import { LIBRARY_SORT_LABELS } from "@/lib/library-sort";
import { colors } from "@/constants/theme";

export type LibraryViewMode = "grid" | "list";

type LibraryToolbarProps = {
  viewMode: LibraryViewMode;
  onViewModeChange: (mode: LibraryViewMode) => void;
  sort: LibrarySortOption;
  onSortPress: () => void;
};

export function LibraryToolbar({
  viewMode,
  onViewModeChange,
  sort,
  onSortPress,
}: LibraryToolbarProps) {
  return (
    <View className="mb-4 mt-5 flex-row items-center justify-between px-5">
      <Pressable
        onPress={onSortPress}
        className="max-w-[70%] flex-row items-center gap-2 rounded-xl px-3 py-2"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        <Ionicons name="swap-vertical" size={16} color={colors.textMuted} />
        <Text
          className="text-sm font-medium"
          style={{ color: colors.textMuted }}
          numberOfLines={1}
        >
          {LIBRARY_SORT_LABELS[sort]}
        </Text>
      </Pressable>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => onViewModeChange("grid")}
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              viewMode === "grid" ? colors.gold : colors.surfaceElevated,
          }}
        >
          <Ionicons
            name="grid"
            size={18}
            color={viewMode === "grid" ? "#000000" : colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => onViewModeChange("list")}
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              viewMode === "list" ? colors.gold : colors.surfaceElevated,
          }}
        >
          <Ionicons
            name="list"
            size={18}
            color={viewMode === "list" ? "#000000" : colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}
