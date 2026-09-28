import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { ProfileFormModal } from "@/components/profile/profile-form-modal";
import { AppConfirmDialog } from "@/components/ui/app-confirm-dialog";
import { colors } from "@/constants/theme";
import { updateAccountEmail } from "@/lib/auth-service";

type ChangeEmailModalProps = {
  visible: boolean;
  currentEmail: string;
  pendingEmail?: string | null;
  onClose: () => void;
  onRequested: (pendingEmail: string) => void;
};

export function ChangeEmailModal({
  visible,
  currentEmail,
  pendingEmail,
  onClose,
  onRequested,
}: ChangeEmailModalProps) {
  const [email, setEmail] = useState(currentEmail);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail(pendingEmail ?? currentEmail);
      setError(null);
    }
  }, [visible, currentEmail, pendingEmail]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { pendingEmail: nextPending } = await updateAccountEmail(email);
      setConfirmOpen(false);
      onRequested(nextPending);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update email.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileFormModal
        visible={visible}
        title="Change email"
        onClose={onClose}
        footer={
          <Pressable
            onPress={() => setConfirmOpen(true)}
            disabled={saving}
            className="rounded-2xl py-4 active:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: colors.gold }}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-center text-base font-bold text-black">
                Request email change
              </Text>
            )}
          </Pressable>
        }
      >
        <Text className="mb-4 text-sm leading-5" style={{ color: colors.textMuted }}>
          Use a @gmail.com address. Supabase will email you a confirmation link
          before your address changes. Your sign-in email stays{" "}
          <Text style={{ color: colors.text }}>{currentEmail}</Text> until you
          confirm.
        </Text>
        {pendingEmail ? (
          <Text className="mb-4 text-sm leading-5" style={{ color: colors.gold }}>
            Pending change to {pendingEmail}. Confirm via email or enter a
            different address below.
          </Text>
        ) : null}
        <AuthField
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="New email"
          value={email}
          onChangeText={setEmail}
        />
        {error ? (
          <Text className="text-sm" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
      </ProfileFormModal>

      <AppConfirmDialog
        visible={confirmOpen}
        title="Confirm email change?"
        message={`We'll send a confirmation link to ${email.trim().toLowerCase()}. Your current email stays active until you confirm.`}
        confirmLabel="Send confirmation"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleSave()}
      />
    </>
  );
}
