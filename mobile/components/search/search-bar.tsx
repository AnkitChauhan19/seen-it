import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, TextInput, View } from "react-native";

import { colors } from "@/constants/theme";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  showBack?: boolean;
  onBack?: () => void;
  autoFocus?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  showBack,
  onBack,
  autoFocus,
}: SearchBarProps) {
  return (
    <View className="mb-2 flex-row items-center gap-2 px-5">
      {showBack ? (
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceElevated }}
          hitSlop={4}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      ) : null}

      <View
        className="min-h-12 flex-1 flex-row items-center gap-2 rounded-2xl px-4"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        {!showBack ? (
          <Ionicons name="search" size={20} color={colors.textSubtle} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search for a title..."
          placeholderTextColor={colors.textSubtle}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 py-3 text-base"
          style={{ color: colors.text }}
        />
        {value.length > 0 ? (
          <Pressable onPress={() => onChangeText("")} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
