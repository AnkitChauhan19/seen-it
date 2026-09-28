import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TheaterAddModal } from "@/components/theater/theater-add-modal";
import { AppActionSheet } from "@/components/ui/app-action-sheet";
import { AppNoticeDialog } from "@/components/ui/app-notice-dialog";
import { colors } from "@/constants/theme";
import {
  useUserMediaMutations,
  useUserMediaState,
} from "@/hooks/use-user-media";
import {
  availableLibraryAddOptions,
  hasAnyLibraryMembership,
  libraryMembershipLabels,
  normalizeShelfCategory,
  rowHasTheaterMembership,
} from "@/lib/library-membership";
import {
  paramsToMediaSnapshot,
  type MediaDetailParams,
} from "@/lib/media-route-params";
import { tmdbPosterUrl } from "@/lib/tmdb-images";
import { LIBRARY_CATEGORY_LABELS } from "@/types/user-media";
import type { LibraryCategory, TheaterWatchInput } from "@/types/user-media";

export default function MediaDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<MediaDetailParams>();
  const compositeId = params.id ?? "";

  const snapshot = useMemo(() => paramsToMediaSnapshot(params), [params]);
  const { data: userMedia, isLoading } = useUserMediaState(compositeId);
  const {
    addWatchlist,
    addLibrary,
    addLibraryTheater,
    remove,
    removeTheater,
    removeShelf,
  } = useUserMediaMutations();

  const [librarySheetOpen, setLibrarySheetOpen] = useState(false);
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [notice, setNotice] = useState<{
    title: string;
    message?: string;
  } | null>(null);

  const posterUri = tmdbPosterUrl(params.posterPath ?? "");
  const onWatchlist = userMedia?.status === "watchlist";
  const inLibrary = userMedia ? hasAnyLibraryMembership(userMedia) : false;
  const membershipSummary = userMedia
    ? libraryMembershipLabels(userMedia).join(" · ")
    : "";
  const libraryAddOptions = useMemo(
    () => availableLibraryAddOptions(userMedia ?? null, snapshot),
    [userMedia, snapshot],
  );

  const showNotice = (title: string, message?: string) => {
    setNotice({ title, message });
  };

  const ensureSnapshot = () => {
    if (!snapshot) {
      showNotice(
        "Missing info",
        "Open this title from Search to add it to your lists.",
      );
      return null;
    }
    return snapshot;
  };

  const toggleWatchlist = () => {
    const snap = ensureSnapshot();
    if (!snap) return;

    if (inLibrary) {
      showNotice(
        "Already in library",
        "Remove from library first if you want it only on your watchlist.",
      );
      return;
    }

    if (onWatchlist && userMedia) {
      void remove.mutate(userMedia.id, {
        onSuccess: () => showNotice("Removed from watchlist"),
      });
      return;
    }

    void addWatchlist.mutate(
      { snapshot: snap },
      { onSuccess: () => showNotice("Added to watchlist") },
    );
  };

  const addToLibraryCategory = (category: LibraryCategory) => {
    const snap = ensureSnapshot();
    if (!snap) return;

    if (category === "theaters") {
      setTheaterModalOpen(true);
      return;
    }

    void addLibrary.mutate(
      { snapshot: snap, category },
      {
        onSuccess: () =>
          showNotice(
            "Added to library",
            LIBRARY_CATEGORY_LABELS[category],
          ),
      },
    );
  };

  const submitTheaterDetails = (details: TheaterWatchInput) => {
    const snap = ensureSnapshot();
    if (!snap) return;

    void addLibraryTheater.mutate(
      { snapshot: snap, details },
      {
        onSuccess: () => {
          setTheaterModalOpen(false);
          showNotice("Added to library", LIBRARY_CATEGORY_LABELS.theaters);
        },
        onError: (err) =>
          showNotice("Could not save", err.message),
      },
    );
  };

  const removeTheaterFromLibrary = () => {
    if (!userMedia) return;
    void removeTheater.mutate(userMedia.id, {
      onSuccess: () => showNotice("Removed from theaters"),
    });
  };

  const removeShelfFromLibrary = () => {
    if (!userMedia) return;
    void removeShelf.mutate(userMedia.id, {
      onSuccess: () => showNotice("Removed from shelf"),
    });
  };

  const removeEntireLibraryEntry = () => {
    if (!userMedia) return;
    void remove.mutate(userMedia.id, {
      onSuccess: () => showNotice("Removed from library"),
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: params.title ?? "Title" }} />
      <SafeAreaView
        className="flex-1"
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
          <View className="flex-row gap-4">
            <View
              className="overflow-hidden rounded-2xl"
              style={{
                width: 100,
                height: 145,
                backgroundColor: colors.surfaceWarm,
              }}
            >
              {posterUri ? (
                <Image
                  source={{ uri: posterUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {params.title ?? "Unknown"}
              </Text>
              <Text className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                {params.year ?? "—"}
                {params.typeLabel ? ` • ${params.typeLabel}` : ""}
              </Text>
              {params.rating ? (
                <Text className="mt-1 text-sm" style={{ color: colors.gold }}>
                  ⭐ {params.rating}
                </Text>
              ) : null}
            </View>
          </View>

          {params.synopsis ? (
            <Text
              className="mt-5 text-sm leading-6"
              style={{ color: colors.textMuted }}
              numberOfLines={4}
            >
              {params.synopsis}
            </Text>
          ) : null}

          {isLoading ? (
            <ActivityIndicator className="mt-6" color={colors.gold} />
          ) : null}

          {inLibrary && membershipSummary ? (
            <Text
              className="mt-5 text-sm leading-5"
              style={{ color: colors.gold }}
            >
              In your library: {membershipSummary}
            </Text>
          ) : null}

          <View className="mt-8 gap-3">
            <Pressable
              onPress={toggleWatchlist}
              disabled={addWatchlist.isPending || remove.isPending}
              className="rounded-2xl py-4"
              style={{
                backgroundColor: onWatchlist ? colors.surfaceElevated : colors.gold,
              }}
            >
              <Text
                className="text-center text-base font-bold"
                style={{ color: onWatchlist ? colors.gold : "#000" }}
              >
                {onWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              </Text>
            </Pressable>

            {libraryAddOptions.length > 0 || inLibrary ? (
              <Pressable
                onPress={() => setLibrarySheetOpen(true)}
                disabled={addLibrary.isPending || addLibraryTheater.isPending}
                className="rounded-2xl py-4"
                style={{ backgroundColor: colors.surfaceElevated }}
              >
                <Text
                  className="text-center text-base font-bold"
                  style={{ color: colors.text }}
                >
                  {inLibrary ? "Library" : "Add to library"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable onPress={() => router.back()} className="mt-6 py-2">
            <Text className="text-center text-sm" style={{ color: colors.link }}>
              Back
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <AppActionSheet
        visible={librarySheetOpen}
        title={inLibrary ? "Library" : "Add to library"}
        message={
          inLibrary
            ? membershipSummary
              ? `On: ${membershipSummary}`
              : undefined
            : "Choose where this title belongs in your library."
        }
        onClose={() => setLibrarySheetOpen(false)}
        options={[
          ...libraryAddOptions.map((opt) => ({
            key: `add-${opt.category}`,
            label: opt.label,
            onPress: () => {
              setLibrarySheetOpen(false);
              addToLibraryCategory(opt.category);
            },
          })),
          ...(userMedia && rowHasTheaterMembership(userMedia)
            ? [
                {
                  key: "remove-theater",
                  label: `Remove from ${LIBRARY_CATEGORY_LABELS.theaters}`,
                  destructive: true,
                  onPress: () => {
                    setLibrarySheetOpen(false);
                    removeTheaterFromLibrary();
                  },
                },
              ]
            : []),
          ...(userMedia && normalizeShelfCategory(userMedia.library_category)
            ? [
                {
                  key: "remove-shelf",
                  label: `Remove from ${LIBRARY_CATEGORY_LABELS[normalizeShelfCategory(userMedia.library_category)!]}`,
                  destructive: true,
                  onPress: () => {
                    setLibrarySheetOpen(false);
                    removeShelfFromLibrary();
                  },
                },
              ]
            : []),
          ...(userMedia &&
          libraryMembershipLabels(userMedia).length > 1
            ? [
                {
                  key: "remove-all",
                  label: "Remove from all shelves",
                  destructive: true,
                  onPress: () => {
                    setLibrarySheetOpen(false);
                    removeEntireLibraryEntry();
                  },
                },
              ]
            : []),
        ]}
      />

      <TheaterAddModal
        visible={theaterModalOpen}
        mediaTitle={params.title ?? "Title"}
        isSubmitting={addLibraryTheater.isPending}
        onClose={() => setTheaterModalOpen(false)}
        onSubmit={submitTheaterDetails}
      />

      <AppNoticeDialog
        visible={notice !== null}
        title={notice?.title ?? ""}
        message={notice?.message}
        onConfirm={() => setNotice(null)}
        onClose={() => setNotice(null)}
      />
    </>
  );
}
