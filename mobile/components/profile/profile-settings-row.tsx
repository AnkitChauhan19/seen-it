import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type ProfileSettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  destructive?: boolean;
  onPress?: () => void;
};

export function ProfileSettingsRow({
  icon,
  title,
  subtitle,
  value,
  destructive,
  onPress,
}: ProfileSettingsRowProps) {
  const tint = destructive ? colors.error : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
    >
      <Ionicons name={icon} size={22} color={destructive ? colors.error : colors.textMuted} />
      <View className="min-w-0 flex-1">
        <Text className="text-base font-semibold" style={{ color: tint }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-sm" style={{ color: colors.textMuted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className="text-sm" style={{ color: colors.textMuted }}>
          {value}
        </Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      ) : null}
    </Pressable>
  );
}
