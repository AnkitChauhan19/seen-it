import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export type WatchlistPriority = "high" | "medium" | "low";

const PRIORITY_STYLES: Record<
  WatchlistPriority,
  { label: string; background: string; text: string }
> = {
  high: {
    label: "High Priority",
    background: "#ef4444",
    text: "#ffffff",
  },
  medium: {
    label: "Medium Priority",
    background: colors.gold,
    text: "#000000",
  },
  low: {
    label: "Low Priority",
    background: "#0d9488",
    text: "#ffffff",
  },
};

type PriorityBadgeProps = {
  priority: WatchlistPriority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority];

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: style.background }}
    >
      <Text className="text-[10px] font-bold" style={{ color: style.text }}>
        {style.label}
      </Text>
    </View>
  );
}
