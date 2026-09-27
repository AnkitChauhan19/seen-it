import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  return (
    <SafeAreaView
      className="flex-1 px-6"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-center text-base" style={{ color: colors.textMuted }}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}
