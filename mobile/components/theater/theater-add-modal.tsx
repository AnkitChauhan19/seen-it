import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormatCombobox } from "@/components/theater/format-combobox";
import { THEATER_LANGUAGES, type TheaterLanguage } from "@/constants/theater";
import { colors } from "@/constants/theme";
import type { TheaterWatchInput } from "@/types/user-media";

type TheaterAddModalProps = {
  visible: boolean;
  mediaTitle: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (details: TheaterWatchInput) => void;
};

export function TheaterAddModal({
  visible,
  mediaTitle,
  isSubmitting,
  onClose,
  onSubmit,
}: TheaterAddModalProps) {
  const [theaterName, setTheaterName] = useState("");
  const [language, setLanguage] = useState<TheaterLanguage>("English");
  const [format, setFormat] = useState("");

  const reset = () => {
    setTheaterName("");
    setLanguage("English");
    setFormat("");
  };

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!theaterName.trim()) return;
    if (!format.trim()) return;
    onSubmit({
      theaterName: theaterName.trim(),
      language,
      format: format.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-row items-center justify-between border-b px-5 py-3" style={{ borderColor: colors.border }}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text className="text-base" style={{ color: colors.link }}>
              Cancel
            </Text>
          </Pressable>
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Theaters
          </Text>
          <View className="w-14" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        >
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Adding to library
          </Text>
          <Text className="mt-1 text-xl font-bold" style={{ color: colors.text }}>
            {mediaTitle}
          </Text>

          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium" style={{ color: colors.textMuted }}>
              Theatre
            </Text>
            <TextInput
              value={theaterName}
              onChangeText={setTheaterName}
              placeholder="Cinema name"
              placeholderTextColor={colors.textSubtle}
              className="rounded-xl px-4 py-3 text-base"
              style={{
                color: colors.text,
                backgroundColor: colors.surfaceElevated,
              }}
            />
          </View>

          <View className="mt-5">
            <Text className="mb-2 text-sm font-medium" style={{ color: colors.textMuted }}>
              Language
            </Text>
            <View className="flex-row gap-2">
              {THEATER_LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    className="rounded-full px-5 py-2"
                    style={{
                      backgroundColor: active
                        ? colors.gold
                        : colors.surfaceElevated,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: active ? "#000" : colors.textMuted }}
                    >
                      {lang}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-5">
            <FormatCombobox value={format} onChange={setFormat} />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={
              isSubmitting || !theaterName.trim() || !format.trim()
            }
            className="mt-8 rounded-2xl py-4 active:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: colors.gold }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-center text-base font-bold text-black">
                Save to Theaters
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
