import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export const WATCHLIST_FILTERS = ["All", "Movies", "TV Shows", "Anime"] as const;

export type WatchlistFilter = (typeof WATCHLIST_FILTERS)[number];

type WatchlistFilterChipsProps = {
  active: WatchlistFilter;
  onChange: (filter: WatchlistFilter) => void;
};

export function WatchlistFilterChips({
  active,
  onChange,
}: WatchlistFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pb-4"
    >
      {WATCHLIST_FILTERS.map((filter) => {
        const isActive = filter === active;

        return (
          <Pressable key={filter} onPress={() => onChange(filter)}>
            <View
              className="rounded-full px-5 py-2"
              style={{
                backgroundColor: isActive ? colors.gold : colors.surfaceElevated,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: isActive ? "#000000" : colors.textMuted }}
              >
                {filter}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
