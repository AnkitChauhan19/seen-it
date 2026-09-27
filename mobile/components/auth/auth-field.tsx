import { TextInput, type TextInputProps } from "react-native";

import { colors } from "@/constants/theme";

type AuthFieldProps = TextInputProps & {
  className?: string;
};

export function AuthField({ className, ...props }: AuthFieldProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      className={`mb-3 rounded-full border px-5 py-4 text-base text-white ${className ?? ""}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text,
      }}
      {...props}
    />
  );
}
