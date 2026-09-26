import { Text, View } from "react-native";

export default function WatchlistScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">Watchlist</Text>
      <Text className="text-center text-slate-400">
        Titles you plan to watch will appear here.
      </Text>
    </View>
  );
}
