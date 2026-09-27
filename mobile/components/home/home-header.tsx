import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { SeenItLogo } from "@/components/ui/seenit-logo";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";

type HomeHeaderProps = {
  /** When set, search icon filters the current tab instead of opening TMDB search. */
  onLocalSearchPress?: () => void;
  localSearchActive?: boolean;
};

export function HomeHeader({
  onLocalSearchPress,
  localSearchActive,
}: HomeHeaderProps) {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  const initials = profile
    ? `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase()
    : session?.user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <View className="mb-4 flex-row items-center justify-between px-5 pt-2">
      <SeenItLogo size="sm" />

      <View className="flex-row items-center gap-3">
        {onLocalSearchPress ? (
          <Pressable
            onPress={onLocalSearchPress}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: localSearchActive
                ? colors.gold
                : colors.surfaceElevated,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={localSearchActive ? "#000000" : colors.text}
            />
          </Pressable>
        ) : (
          <Link href="/(tabs)/search" asChild>
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceElevated }}
            >
              <Ionicons name="search" size={20} color={colors.text} />
            </Pressable>
          </Link>
        )}

        <Link href="/(tabs)/profile" asChild>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.gold }}
          >
            <Text className="text-sm font-bold text-black">{initials}</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
