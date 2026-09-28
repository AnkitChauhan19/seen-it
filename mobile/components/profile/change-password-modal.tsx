import { useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { ProfileFormModal } from "@/components/profile/profile-form-modal";
import { AppConfirmDialog } from "@/components/ui/app-confirm-dialog";
import { colors } from "@/constants/theme";
import { updateLoggedInPassword } from "@/lib/auth-service";

type ChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function ChangePasswordModal({
  visible,
  onClose,
  onSaved,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setConfirmOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const openConfirm = () => {
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  const applyPassword = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateLoggedInPassword(currentPassword, newPassword);
      setConfirmOpen(false);
      onSaved();
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileFormModal
        visible={visible}
        title="Change password"
        onClose={handleClose}
        footer={
          <Pressable
            onPress={openConfirm}
            disabled={
              saving ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="rounded-2xl py-4 active:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: colors.gold }}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-center text-base font-bold text-black">
                Update password
              </Text>
            )}
          </Pressable>
        }
      >
        <Text className="mb-4 text-sm leading-5" style={{ color: colors.textMuted }}>
          Enter your current password, then choose a new one (8+ characters with
          upper, lower, number, and special character).
        </Text>
        <AuthField
          placeholder="Current password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
        />
        <AuthField
          placeholder="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
        <AuthField
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
        title="Update password?"
        message="You'll use the new password the next time you sign in."
        confirmLabel="Update"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void applyPassword()}
      />
    </>
  );
}
