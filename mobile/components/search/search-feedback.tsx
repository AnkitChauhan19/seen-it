import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";

type SearchErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function SearchErrorState({ message, onRetry }: SearchErrorStateProps) {
  return (
    <View className="items-center px-5 py-10">
      <Ionicons name="cloud-offline-outline" size={36} color={colors.textMuted} />
      <Text
        className="mt-3 text-center text-base"
        style={{ color: colors.textMuted }}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-4 rounded-full px-5 py-2"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        <Text className="font-semibold" style={{ color: colors.gold }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export function SearchLoadingFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color={colors.gold} />
      <Text className="mt-2 text-sm" style={{ color: colors.textSubtle }}>
        Loading more…
      </Text>
    </View>
  );
}

export function SearchQueryTooShort() {
  return (
    <View className="px-5 py-8">
      <Text className="text-center text-base" style={{ color: colors.textMuted }}>
        Type at least 2 characters to search.
      </Text>
    </View>
  );
}
