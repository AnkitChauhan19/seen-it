import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type AppConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AppConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: AppConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        onPress={onCancel}
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
            <Text
              className="mt-2 text-sm leading-5"
              style={{ color: colors.textMuted }}
            >
              {message}
            </Text>
          ) : null}
          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl py-3 active:opacity-90"
              style={{
                backgroundColor: colors.surfaceWarm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-center text-base font-semibold"
                style={{ color: colors.textMuted }}
              >
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl py-3 active:opacity-90 disabled:opacity-60"
              style={{
                backgroundColor: destructive ? colors.error : colors.gold,
              }}
            >
              <Text
                className="text-center text-base font-bold"
                style={{ color: destructive ? "#fff" : "#000" }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
