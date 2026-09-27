import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import type { LibraryFilterStats } from "@/lib/library-stats";
import { colors } from "@/constants/theme";

type LibraryKpiSummaryProps = {
  stats: LibraryFilterStats;
};

export function LibraryKpiSummary({ stats }: LibraryKpiSummaryProps) {
  const avg =
    stats.avgRating != null ? stats.avgRating.toFixed(1) : "—";

  const SUMMARY = [
    {
      key: "watched",
      label: "Watched",
      value: String(stats.watchedCount),
      icon: "film-outline" as const,
      iconColor: "#4ade80",
    },
    {
      key: "theaters",
      label: "Theaters",
      value: String(stats.theatersCount),
      icon: "ticket-outline" as const,
      iconColor: "#fb923c",
    },
    {
      key: "rating",
      label: "Avg. Rating",
      value: avg,
      icon: "star-outline" as const,
      iconColor: colors.gold,
    },
  ];

  return (
    <View className="mb-4 flex-row gap-3 px-5">
      {SUMMARY.map((item) => (
        <View
          key={item.key}
          className="flex-1 rounded-2xl p-3"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
          <Text
            className="mt-2 text-xl font-bold"
            style={{ color: colors.text }}
          >
            {item.value}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
