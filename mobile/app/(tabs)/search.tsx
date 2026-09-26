import { Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">Search</Text>
      <Text className="text-center text-slate-400">
        Search TMDB via FastAPI will be wired up next.
      </Text>
    </View>
  );
}
