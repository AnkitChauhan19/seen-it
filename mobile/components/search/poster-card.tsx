import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import type { SearchMediaItem } from "@/components/search/search-types";
import { searchItemToRouteParams } from "@/lib/media-route-params";
import { colors } from "@/constants/theme";
import { tmdbPosterUrl } from "@/lib/tmdb-images";

type PosterCardProps = {
  item: SearchMediaItem;
  width?: number;
};

export function PosterCard({ item, width = 118 }: PosterCardProps) {
  const posterUri = tmdbPosterUrl(item.posterPath);

  return (
    <Link
      href={{
        pathname: "/media/[id]",
        params: searchItemToRouteParams(item),
      }}
      asChild
    >
      <Pressable style={{ width }}>
        <View
          className="overflow-hidden rounded-2xl"
          style={{ width, height: width * 1.45, backgroundColor: colors.surfaceWarm }}
        >
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}
        </View>
        <Text
          className="mt-2 text-sm font-semibold"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>
          {item.year} • ⭐ {item.rating.toFixed(1)}
        </Text>
      </Pressable>
    </Link>
  );
}
