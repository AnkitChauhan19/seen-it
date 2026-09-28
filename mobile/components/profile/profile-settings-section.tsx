import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

type ProfileSettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function ProfileSettingsSection({
  title,
  children,
}: ProfileSettingsSectionProps) {
  return (
    <View className="mt-6">
      <Text
        className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide"
        style={{ color: colors.textMuted }}
      >
        {title}
      </Text>
      <View
        className="overflow-hidden rounded-2xl"
        style={{ backgroundColor: colors.surfaceElevated }}
      >
        {children}
      </View>
    </View>
  );
}
