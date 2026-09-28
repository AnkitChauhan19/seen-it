import { useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { ProfileFormModal } from "@/components/profile/profile-form-modal";
import { AppConfirmDialog } from "@/components/ui/app-confirm-dialog";
import { colors } from "@/constants/theme";
import { deleteOwnAccountWithPassword } from "@/lib/auth-service";

type DeleteAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reset = () => {
    setPassword("");
    setError(null);
    setConfirmOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteOwnAccountWithPassword(password);
      setConfirmOpen(false);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete account.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ProfileFormModal
        visible={visible}
        title="Delete account"
        onClose={handleClose}
        footer={
          <Pressable
            onPress={() => {
              if (!password) {
                setError("Enter your password to continue.");
                return;
              }
              setError(null);
              setConfirmOpen(true);
            }}
            disabled={deleting}
            className="rounded-2xl py-4 active:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: colors.error }}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-bold text-white">
                Delete my account
              </Text>
            )}
          </Pressable>
        }
      >
        <Text className="mb-4 text-sm leading-5" style={{ color: colors.textMuted }}>
          This permanently removes your account, library, and watchlist. Enter
          your password to confirm it&apos;s really you.
        </Text>
        <AuthField
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        {error ? (
          <Text className="text-sm" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
      </ProfileFormModal>

      <AppConfirmDialog
        visible={confirmOpen}
        title="Delete account forever?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
