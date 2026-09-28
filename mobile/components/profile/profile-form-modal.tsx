import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

type ProfileFormModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ProfileFormModal({
  visible,
  title,
  onClose,
  children,
  footer,
}: ProfileFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="flex-row items-center justify-between border-b px-5 py-3"
          style={{ borderColor: colors.border }}
        >
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-base" style={{ color: colors.link }}>
              Cancel
            </Text>
          </Pressable>
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            {title}
          </Text>
          <View className="w-14" />
        </View>
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View className="border-t px-5 py-4" style={{ borderColor: colors.border }}>
            {footer}
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
