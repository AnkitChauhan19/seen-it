import { type ReactNode } from "react";
import { Dimensions, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthBranding } from "@/components/auth/auth-branding";

type AuthScreenShellProps = {
  children: ReactNode;
};

export function AuthScreenShell({ children }: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const minContentHeight =
    Dimensions.get("window").height - insets.top - insets.bottom;

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#000000" }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          minHeight: minContentHeight,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.OS === "ios" ? 96 : 140}
        extraHeight={Platform.OS === "ios" ? insets.top + 48 : 160}
      >
        <View
          style={{
            flex: 1,
            minHeight: minContentHeight - insets.bottom,
            justifyContent: "space-between",
          }}
        >
          <View className="px-6 pb-4 pt-6">
            <AuthBranding />
          </View>

          <View
            className="rounded-t-[30px] px-6 pb-8 pt-8"
            style={{ backgroundColor: "#121212" }}
          >
            {children}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
