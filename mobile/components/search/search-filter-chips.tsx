import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export const SEARCH_FILTERS = ["All", "Movies", "TV Shows", "Anime"] as const;

export type SearchFilter = (typeof SEARCH_FILTERS)[number];

type SearchFilterChipsProps = {
  active: SearchFilter;
  onChange: (filter: SearchFilter) => void;
  counts?: Record<SearchFilter, number>;
};

function chipLabel(filter: SearchFilter, counts?: Record<SearchFilter, number>) {
  if (counts === undefined) {
    return filter;
  }
  return `${filter} (${counts[filter]})`;
}

export function SearchFilterChips({
  active,
  onChange,
  counts,
}: SearchFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerClassName="gap-2 px-5 pb-4"
    >
      {SEARCH_FILTERS.map((filter) => {
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
                {chipLabel(filter, counts)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
