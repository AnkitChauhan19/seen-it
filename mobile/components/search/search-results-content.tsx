import { Text, View } from "react-native";

import { SearchResultCard } from "@/components/search/search-result-card";
import {
  SearchErrorState,
  SearchLoadingFooter,
  SearchQueryTooShort,
} from "@/components/search/search-feedback";
import { SearchResultsSkeleton } from "@/components/search/search-skeleton";
import type { SearchMediaItem } from "@/components/search/search-types";
import { colors } from "@/constants/theme";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/media-api";

type SearchResultsContentProps = {
  items: SearchMediaItem[];
  query: string;
  isLoading: boolean;
  isFetchingMore: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export function SearchResultsContent({
  items,
  query,
  isLoading,
  isFetchingMore,
  isError,
  errorMessage,
  onRetry,
}: SearchResultsContentProps) {
  if (query.length > 0 && query.length < MIN_SEARCH_QUERY_LENGTH) {
    return <SearchQueryTooShort />;
  }

  if (isError) {
    return (
      <SearchErrorState
        message={errorMessage ?? "Search failed. Check your connection and try again."}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (items.length === 0) {
    return (
      <View className="px-5 py-8">
        <Text className="text-center text-base" style={{ color: colors.textMuted }}>
          No results for &quot;{query}&quot;. Try another title.
        </Text>
      </View>
    );
  }

  return (
    <View className="pb-4 pt-1">
      {items.map((item) => (
        <SearchResultCard key={item.id} item={item} />
      ))}
      <SearchLoadingFooter visible={isFetchingMore} />
    </View>
  );
}
