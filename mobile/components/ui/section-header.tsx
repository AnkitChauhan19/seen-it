import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionLabel = "See All",
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between px-5">
      <Text className="text-lg font-bold" style={{ color: colors.text }}>
        {title}
      </Text>
      {onActionPress ? (
        <Pressable onPress={onActionPress}>
          <Text className="text-sm font-medium" style={{ color: colors.link }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
