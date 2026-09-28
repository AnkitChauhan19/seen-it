import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Text, View } from "react-native";

import { SectionHeader } from "@/components/ui/section-header";
import { useHomeStats } from "@/hooks/use-user-media";
import { colors } from "@/constants/theme";

type LibraryKpiRowProps = {
  onSeeAll?: () => void;
};

export function LibraryKpiRow({ onSeeAll }: LibraryKpiRowProps) {
  const { data } = useHomeStats();

  const kpis = [
    {
      key: "watched",
      label: "Watched",
      value: String(data?.watchedCount ?? 0),
      icon: "film-outline" as const,
      iconColor: colors.gold,
    },
    {
      key: "watchlist",
      label: "Watchlist",
      value: String(data?.watchlistCount ?? 0),
      icon: "bookmark-outline" as const,
      iconColor: "#f472b6",
    },
    {
      key: "theaters",
      label: "Theaters",
      value: String(data?.theatersCount ?? 0),
      icon: "ticket-outline" as const,
      iconColor: "#fb923c",
    },
  ];

  return (
    <View className="mt-6">
      <SectionHeader title="Your Library" onActionPress={onSeeAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-5"
      >
        {kpis.map((kpi) => (
          <View
            key={kpi.key}
            className="w-[108px] rounded-2xl p-3"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            <Ionicons name={kpi.icon} size={22} color={kpi.iconColor} />
            <Text
              className="mt-3 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {kpi.value}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>
              {kpi.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
