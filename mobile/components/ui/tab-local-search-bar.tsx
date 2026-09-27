import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, TextInput, View } from "react-native";

import { colors } from "@/constants/theme";

type TabLocalSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  placeholder?: string;
};

export function TabLocalSearchBar({
  value,
  onChangeText,
  onClose,
  placeholder = "Search in this list…",
}: TabLocalSearchBarProps) {
  return (
    <View className="mb-3 px-5">
      <View
        className="flex-row items-center gap-2 rounded-2xl px-4"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        <Ionicons name="search" size={18} color={colors.textSubtle} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          autoFocus
          className="flex-1 py-3 text-base"
          style={{ color: colors.text }}
        />
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
        </Pressable>
      </View>
    </View>
  );
}
