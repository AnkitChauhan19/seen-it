import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeGreeting } from "@/components/home/home-greeting";
import { HomeHeader } from "@/components/home/home-header";
import { LibraryKpiRow } from "@/components/home/library-kpi-row";
import { RecentlyWatchedHero } from "@/components/home/recently-watched-hero";
import { WatchlistPreviewRow } from "@/components/home/watchlist-preview-row";
import { colors } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <HomeHeader />
        <HomeGreeting />
        <RecentlyWatchedHero />
        <LibraryKpiRow
          onSeeAll={() => router.push("/(tabs)/watched")}
        />
        <WatchlistPreviewRow
          onSeeAll={() => router.push("/(tabs)/watchlist")}
        />
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
