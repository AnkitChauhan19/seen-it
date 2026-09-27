import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { SectionHeader } from "@/components/ui/section-header";
import { useWatchlistPreview } from "@/hooks/use-user-media";
import { colors } from "@/constants/theme";

type WatchlistPreviewRowProps = {
  onSeeAll?: () => void;
};

export function WatchlistPreviewRow({ onSeeAll }: WatchlistPreviewRowProps) {
  const { data: items = [] } = useWatchlistPreview(6);

  return (
    <View className="mt-6">
      <SectionHeader title="On Your Watchlist" onActionPress={onSeeAll} />
      {items.length === 0 ? (
        <View className="px-5 py-2">
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Save titles from Search to build your watchlist.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-5"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={{
                pathname: "/media/[id]",
                params: {
                  id: item.mediaCompositeId,
                  title: item.title,
                  year: item.year,
                  synopsis: item.synopsis,
                  mediaKind: item.mediaKind,
                },
              }}
              asChild
            >
              <Pressable
                className="w-[148px] rounded-2xl p-3 active:opacity-90"
                style={{ backgroundColor: colors.surfaceElevated }}
              >
                <Text
                  className="text-sm font-bold leading-5"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  className="mt-2 text-xs font-medium"
                  style={{ color: colors.textMuted }}
                >
                  {item.year}
                </Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}

      <View className="mt-3 px-5">
        <Link href="/(tabs)/search">
          <Text className="text-sm" style={{ color: colors.link }}>
            Find something to watch →
          </Text>
        </Link>
      </View>
    </View>
  );
}
