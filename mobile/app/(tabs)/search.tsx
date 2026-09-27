import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeHeader } from "@/components/home/home-header";
import { SearchBar } from "@/components/search/search-bar";
import { SearchBrowseContent } from "@/components/search/search-browse-content";
import {
  SearchFilterChips,
  type SearchFilter,
} from "@/components/search/search-filter-chips";
import { SearchHint } from "@/components/search/search-hint";
import { SearchPageHeader } from "@/components/search/search-page-header";
import { SearchResultCard } from "@/components/search/search-result-card";
import {
  SearchErrorState,
  SearchLoadingFooter,
  SearchQueryTooShort,
} from "@/components/search/search-feedback";
import { SearchResultsSkeleton } from "@/components/search/search-skeleton";
import {
  flattenSearchPages,
  searchCountsFromPages,
  useMediaSearch,
  usePopularMovies,
  useTrendingMedia,
} from "@/hooks/use-media-search";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/media-api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { colors } from "@/constants/theme";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("All");
  const debouncedQuery = useDebouncedValue(query, 350);

  const trimmedQuery = query.trim();
  const debouncedTrimmed = debouncedQuery.trim();
  const isResultsMode = trimmedQuery.length > 0;

  const trendingQuery = useTrendingMedia(activeFilter);
  const popularQuery = usePopularMovies();
  const searchQuery = useMediaSearch(debouncedTrimmed, activeFilter);

  const searchItems = useMemo(
    () => flattenSearchPages(searchQuery.data),
    [searchQuery.data],
  );

  const filterCounts = useMemo(
    () => searchCountsFromPages(searchQuery.data),
    [searchQuery.data],
  );

  const browseLoading = trendingQuery.isLoading || popularQuery.isLoading;
  const browseError = trendingQuery.isError || popularQuery.isError;
  const browseErrorMessage =
    (trendingQuery.error as Error | undefined)?.message ??
    (popularQuery.error as Error | undefined)?.message;

  const handleBack = () => {
    setQuery("");
    setActiveFilter("All");
  };

  const handleBrowseRetry = () => {
    void trendingQuery.refetch();
    void popularQuery.refetch();
  };

  const searchPending =
    trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH &&
    debouncedTrimmed !== trimmedQuery;

  const searchHeader = (
    <>
      <HomeHeader />
      {isResultsMode ? (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          showBack
          onBack={handleBack}
        />
      ) : (
        <>
          <SearchPageHeader />
          <SearchBar value={query} onChangeText={setQuery} />
          <SearchHint />
        </>
      )}
      <SearchFilterChips
        active={activeFilter}
        onChange={setActiveFilter}
        counts={isResultsMode ? filterCounts : undefined}
      />
      {searchPending ? (
        <View className="items-center py-2">
          <ActivityIndicator color={colors.gold} size="small" />
        </View>
      ) : null}
    </>
  );

  if (isResultsMode) {
    const showTooShort =
      trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH;
    const showInitialLoading =
      !showTooShort &&
      (searchQuery.isLoading || searchPending) &&
      searchItems.length === 0;
    const showError = searchQuery.isError && !searchPending;

    return (
      <SafeAreaView
        className="flex-1"
        edges={["top"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <FlatList
          data={showInitialLoading || showTooShort || showError ? [] : searchItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SearchResultCard item={item} />}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
              void searchQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
          ListHeaderComponent={searchHeader}
          ListFooterComponent={
            showInitialLoading ? (
              <SearchResultsSkeleton count={4} />
            ) : (
              <SearchLoadingFooter visible={searchQuery.isFetchingNextPage} />
            )
          }
          ListEmptyComponent={
            showTooShort
              ? SearchQueryTooShort
              : showError
                ? () => (
                    <SearchErrorState
                      message={
                        (searchQuery.error as Error | undefined)?.message ??
                        "Search failed."
                      }
                      onRetry={() => void searchQuery.refetch()}
                    />
                  )
                : showInitialLoading
                  ? null
                  : () => (
                      <View className="px-5 py-8">
                        <Text
                          className="text-center text-base"
                          style={{ color: colors.textMuted }}
                        >
                          No results for &quot;{trimmedQuery}&quot;. Try another
                          title.
                        </Text>
                      </View>
                    )
          }
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {searchHeader}
        <SearchBrowseContent
          trending={trendingQuery.data ?? []}
          popularMovies={popularQuery.data ?? []}
          isLoading={browseLoading}
          isError={browseError}
          errorMessage={browseErrorMessage}
          onRetry={handleBrowseRetry}
        />
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
