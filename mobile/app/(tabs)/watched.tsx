import { Text, View } from "react-native";

export default function WatchedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">Watched</Text>
      <Text className="text-center text-slate-400">
        Your watched library will appear here.
      </Text>
    </View>
  );
}
