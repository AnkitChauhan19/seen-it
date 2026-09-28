import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/constants/theme";

type AuthFieldProps = TextInputProps & {
  className?: string;
};

export function AuthField({ className, secureTextEntry, ...props }: AuthFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  const fieldClassName = `rounded-full border px-5 py-4 text-base text-white ${className ?? ""}`;
  const fieldStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };

  if (!isPassword) {
    return (
      <TextInput
        placeholderTextColor={colors.textSubtle}
        className={`mb-3 ${fieldClassName}`}
        style={fieldStyle}
        {...props}
      />
    );
  }

  return (
    <View
      className={`mb-3 flex-row items-center ${fieldClassName}`}
      style={fieldStyle}
    >
      <TextInput
        placeholderTextColor={colors.textSubtle}
        className="flex-1 py-0 text-base"
        style={{ color: colors.text }}
        secureTextEntry={!passwordVisible}
        {...props}
      />
      <Pressable
        onPress={() => setPasswordVisible((v) => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          passwordVisible ? "Hide password" : "Show password"
        }
      >
        <Ionicons
          name={passwordVisible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={colors.textSubtle}
        />
      </Pressable>
    </View>
  );
}
