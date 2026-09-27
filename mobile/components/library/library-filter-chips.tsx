import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export const LIBRARY_FILTERS = [
  "All",
  "Movies",
  "TV Shows",
  "Web Series",
  "Anime",
  "Theaters",
] as const;

export type LibraryFilter = (typeof LIBRARY_FILTERS)[number];

type LibraryFilterChipsProps = {
  active: LibraryFilter;
  onChange: (filter: LibraryFilter) => void;
};

export function LibraryFilterChips({ active, onChange }: LibraryFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pb-4"
    >
      {LIBRARY_FILTERS.map((filter) => {
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
