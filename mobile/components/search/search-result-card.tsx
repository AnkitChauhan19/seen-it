import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import type { SearchMediaItem } from "@/components/search/search-types";
import { colors } from "@/constants/theme";
import { tmdbPosterUrl } from "@/lib/tmdb-images";

type SearchResultCardProps = {
  item: SearchMediaItem;
};

export function SearchResultCard({ item }: SearchResultCardProps) {
  const posterUri = tmdbPosterUrl(item.posterPath);

  return (
    <Link
      href={{
        pathname: "/media/[id]",
        params: {
          id: item.id,
          title: item.title,
          year: item.year,
          typeLabel: item.typeLabel,
          posterPath: item.posterPath,
          synopsis: item.synopsis,
          rating: String(item.rating),
          mediaKind: item.mediaKind,
        },
      }}
      asChild
    >
      <Pressable className="mb-3 flex-row items-center gap-3 px-5">
        <View
          className="overflow-hidden rounded-xl"
          style={{
            width: 56,
            height: 80,
            backgroundColor: colors.surfaceWarm,
          }}
        >
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View className="min-h-[80px] flex-1 justify-center">
          <Text
            className="text-base font-bold"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="mt-0.5 text-sm" style={{ color: colors.textMuted }}>
            {item.year} • {item.typeLabel}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.gold }}>
            ⭐ {item.rating.toFixed(1)}{" "}
            <Text style={{ color: colors.textSubtle }}>
              ({item.voteCountLabel})
            </Text>
          </Text>
          <Text
            className="mt-1 text-sm leading-5"
            style={{ color: colors.textMuted }}
            numberOfLines={2}
          >
            {item.synopsis}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
      </Pressable>
    </Link>
  );
}
