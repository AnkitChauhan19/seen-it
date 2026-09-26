import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">Home</Text>
      <Text className="text-center text-slate-400">
        Your recent activity and quick actions will live here.
      </Text>
    </View>
  );
}
