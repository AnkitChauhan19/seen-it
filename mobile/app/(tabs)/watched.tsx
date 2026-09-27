import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeHeader } from "@/components/home/home-header";
import { LibraryContent } from "@/components/library/library-content";
import {
  LibraryFilterChips,
  type LibraryFilter,
} from "@/components/library/library-filter-chips";
import { LibraryKpiSummary } from "@/components/library/library-kpi-summary";
import { LibraryPageHeader } from "@/components/library/library-page-header";
import {
  LibraryToolbar,
  type LibraryViewMode,
} from "@/components/library/library-toolbar";
import { AppActionSheet } from "@/components/ui/app-action-sheet";
import { TabLocalSearchBar } from "@/components/ui/tab-local-search-bar";
import { useLibrary, useUserMediaMutations } from "@/hooks/use-user-media";
import { computeLibraryFilterStats } from "@/lib/library-stats";
import {
  filterItemsBySearchQuery,
  LIBRARY_SORT_LABELS,
  sortLibraryItems,
  type LibrarySortOption,
} from "@/lib/library-sort";
import { colors } from "@/constants/theme";

const SORT_OPTIONS: LibrarySortOption[] = [
  "recent",
  "title_asc",
  "title_desc",
  "year_desc",
  "year_asc",
];

export default function WatchedScreen() {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("All");
  const [viewMode, setViewMode] = useState<LibraryViewMode>("grid");
  const [sort, setSort] = useState<LibrarySortOption>("recent");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items = [], isLoading } = useLibrary(activeFilter);
  const { remove } = useUserMediaMutations();

  const filterStats = useMemo(
    () => computeLibraryFilterStats(items),
    [items],
  );

  const displayedItems = useMemo(() => {
    const searched = filterItemsBySearchQuery(items, searchQuery);
    return sortLibraryItems(searched, sort);
  }, [items, searchQuery, sort]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearchQuery("");
      return !open;
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <HomeHeader
          onLocalSearchPress={toggleSearch}
          localSearchActive={searchOpen}
        />
        {searchOpen ? (
          <TabLocalSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClose={toggleSearch}
            placeholder="Search your library…"
          />
        ) : null}
        <LibraryPageHeader />
        <LibraryFilterChips active={activeFilter} onChange={setActiveFilter} />
        <LibraryKpiSummary stats={filterStats} />
        <LibraryToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sort={sort}
          onSortPress={() => setSortSheetOpen(true)}
        />
        <LibraryContent
          viewMode={viewMode}
          items={displayedItems}
          isLoading={isLoading}
          onRemove={(id) => void remove.mutate(id)}
        />
        <View className="h-4" />
      </ScrollView>

      <AppActionSheet
        visible={sortSheetOpen}
        title="Sort library"
        onClose={() => setSortSheetOpen(false)}
        options={SORT_OPTIONS.map((option) => ({
          key: option,
          label: LIBRARY_SORT_LABELS[option],
          onPress: () => setSort(option),
        }))}
      />
    </SafeAreaView>
  );
}
