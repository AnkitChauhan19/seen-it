import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeHeader } from "@/components/home/home-header";
import { TabLocalSearchBar } from "@/components/ui/tab-local-search-bar";
import { WatchlistContent } from "@/components/watchlist/watchlist-content";
import {
  WatchlistFilterChips,
  type WatchlistFilter,
} from "@/components/watchlist/watchlist-filter-chips";
import { WatchlistPageHeader } from "@/components/watchlist/watchlist-page-header";
import {
  useUserMediaMutations,
  useWatchlist,
} from "@/hooks/use-user-media";
import { filterItemsBySearchQuery } from "@/lib/library-sort";
import { colors } from "@/constants/theme";

export default function WatchlistScreen() {
  const [activeFilter, setActiveFilter] = useState<WatchlistFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: items = [], isLoading } = useWatchlist(activeFilter);
  const { remove, setPriority } = useUserMediaMutations();

  const displayedItems = useMemo(
    () => filterItemsBySearchQuery(items, searchQuery),
    [items, searchQuery],
  );

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
            placeholder="Search your watchlist…"
          />
        ) : null}
        <WatchlistPageHeader />
        <WatchlistFilterChips active={activeFilter} onChange={setActiveFilter} />
        <WatchlistContent
          items={displayedItems}
          isLoading={isLoading}
          onRemove={(id) => void remove.mutate(id)}
          onPriorityChange={(id, priority) =>
            void setPriority.mutate({ userMediaId: id, priority })
          }
        />
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
