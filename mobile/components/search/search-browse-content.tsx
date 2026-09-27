import { ScrollView, View } from "react-native";

import { PosterCard } from "@/components/search/poster-card";
import { SearchErrorState } from "@/components/search/search-feedback";
import { PosterRowSkeleton } from "@/components/search/search-skeleton";
import type { SearchMediaItem } from "@/components/search/search-types";
import { SectionHeader } from "@/components/ui/section-header";

type SearchBrowseContentProps = {
  trending: SearchMediaItem[];
  popularMovies: SearchMediaItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function SearchBrowseContent({
  trending,
  popularMovies,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: SearchBrowseContentProps) {
  if (isError) {
    return (
      <SearchErrorState
        message={errorMessage ?? "Could not load recommendations."}
        onRetry={onRetry}
      />
    );
  }

  return (
    <View className="pb-4">
      <SectionHeader title="Trending This Week" />
      {isLoading ? (
        <PosterRowSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-5"
        >
          {trending.map((item) => (
            <PosterCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}

      <View className="mt-6">
        <SectionHeader title="Popular Movies" />
        {isLoading ? (
          <PosterRowSkeleton />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-5"
          >
            {popularMovies.map((item) => (
              <PosterCard key={`popular-${item.id}`} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
