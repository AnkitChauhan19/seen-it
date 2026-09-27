import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/constants/theme";

const CATEGORIES = ["Home", "Movies", "TV Shows", "Anime"] as const;

type CategoryTabsProps = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pb-4"
    >
      {CATEGORIES.map((category) => {
        const isActive = category === active;

        return (
          <Pressable key={category} onPress={() => onChange(category)}>
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
                {category}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
