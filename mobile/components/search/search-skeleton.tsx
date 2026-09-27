import { View, type DimensionValue } from "react-native";

import { colors } from "@/constants/theme";

function Block({
  width,
  height,
  className,
}: {
  width?: DimensionValue;
  height: number;
  className?: string;
}) {
  return (
    <View
      className={className}
      style={{
        width,
        height,
        backgroundColor: colors.surfaceElevated,
      }}
    />
  );
}

export function PosterRowSkeleton() {
  return (
    <View className="flex-row gap-3 px-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index}>
          <Block width={118} height={171} className="rounded-2xl" />
          <Block width={90} height={12} className="mt-2 rounded" />
          <Block width={70} height={10} className="mt-2 rounded" />
        </View>
      ))}
    </View>
  );
}

export function SearchResultSkeleton() {
  return (
    <View className="mb-3 flex-row items-center gap-3 px-5">
      <Block width={56} height={80} className="rounded-xl" />
      <View className="flex-1 gap-2">
        <Block width="75%" height={14} className="rounded" />
        <Block width="45%" height={12} className="rounded" />
        <Block width="55%" height={12} className="rounded" />
        <Block width="100%" height={32} className="rounded" />
      </View>
    </View>
  );
}

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="pt-1">
      {Array.from({ length: count }).map((_, index) => (
        <SearchResultSkeleton key={index} />
      ))}
    </View>
  );
}
