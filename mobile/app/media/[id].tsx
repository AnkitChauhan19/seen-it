import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function MediaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="mb-2 text-2xl font-semibold text-white">
        Media Details
      </Text>
      <Text className="text-center text-slate-400">
        Details for media id: {id ?? "—"}
      </Text>
    </View>
  );
}
