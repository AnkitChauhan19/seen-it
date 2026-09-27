import { Text } from "react-native";

import { colors } from "@/constants/theme";

type SeenItLogoProps = {
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
} as const;

export function SeenItLogo({ size = "md" }: SeenItLogoProps) {
  return (
    <Text className={`${sizes[size]} font-bold tracking-tight`}>
      <Text style={{ color: colors.text }}>Seen</Text>
      <Text style={{ color: colors.gold }}>It</Text>
    </Text>
  );
}
