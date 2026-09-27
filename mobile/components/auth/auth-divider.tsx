import { Text, View } from "react-native";

export function AuthDivider() {
  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-neutral-700" />
      <Text className="mx-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
        Or
      </Text>
      <View className="h-px flex-1 bg-neutral-700" />
    </View>
  );
}
