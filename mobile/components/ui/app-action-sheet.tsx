import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export type AppActionSheetOption = {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type AppActionSheetProps = {
  visible: boolean;
  title?: string;
  message?: string;
  options: AppActionSheetOption[];
  onClose: () => void;
};

export function AppActionSheet({
  visible,
  title,
  message,
  options,
  onClose,
}: AppActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end px-4 pb-8"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="overflow-hidden rounded-2xl"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            {title ? (
              <View
                className="border-b px-4 py-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  {title}
                </Text>
                {message ? (
                  <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                    {message}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {options.map((option, index) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                className="px-4 py-4 active:opacity-80"
                style={
                  index < options.length - 1
                    ? { borderBottomWidth: 1, borderColor: colors.border }
                    : undefined
                }
              >
                <Text
                  className="text-center text-base font-semibold"
                  style={{
                    color: option.destructive ? colors.error : colors.text,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            className="mt-3 rounded-2xl py-4 active:opacity-90"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.textMuted }}
            >
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
