import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useRecentlyWatched } from "@/hooks/use-user-media";
import { colors } from "@/constants/theme";

export function RecentlyWatchedHero() {
  const { data: items = [] } = useRecentlyWatched(1);
  const latest = items[0];

  if (!latest) {
    return (
      <View className="px-5">
        <View
          className="min-h-[200px] justify-between rounded-3xl p-5"
          style={{ backgroundColor: colors.surfaceWarm }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
            <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
              Recently Watched
            </Text>
          </View>
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              Nothing here yet
            </Text>
            <Text className="mt-2 text-sm" style={{ color: colors.textMuted }}>
              Mark a title as watched to see it featured here.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-5">
      <View
        className="min-h-[200px] justify-between rounded-3xl p-5"
        style={{ backgroundColor: colors.surfaceWarm }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
          <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
            Recently Watched
          </Text>
        </View>
        <View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {latest.title}
          </Text>
          <Text className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            {latest.year} • {latest.type}
          </Text>
        </View>
        <Link
          href={{
            pathname: "/media/[id]",
            params: {
              id: latest.mediaCompositeId,
              title: latest.title,
              year: latest.year,
              synopsis: latest.synopsis,
            },
          }}
          asChild
        >
          <Pressable
            className="flex-row items-center gap-1 self-end rounded-full px-4 py-2"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              View Details
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
