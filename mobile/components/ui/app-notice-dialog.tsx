import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type AppNoticeDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function AppNoticeDialog({
  visible,
  title,
  message,
  confirmLabel = "OK",
  onConfirm,
  onClose,
}: AppNoticeDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: colors.surfaceElevated }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            {title}
          </Text>
          {message ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: colors.textMuted }}>
              {message}
            </Text>
          ) : null}
          <Pressable
            onPress={() => {
              onConfirm();
              onClose();
            }}
            className="mt-5 rounded-xl py-3 active:opacity-90"
            style={{ backgroundColor: colors.gold }}
          >
            <Text className="text-center text-base font-bold text-black">
              {confirmLabel}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
