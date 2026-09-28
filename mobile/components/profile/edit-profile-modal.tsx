import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { AuthField } from "@/components/auth/auth-field";
import { ProfileFormModal } from "@/components/profile/profile-form-modal";
import { AppConfirmDialog } from "@/components/ui/app-confirm-dialog";
import { colors } from "@/constants/theme";
import { updateProfileNames } from "@/lib/auth-service";
import type { Profile } from "@/types/database";

type EditProfileModalProps = {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
};

export function EditProfileModal({
  visible,
  profile,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setError(null);
    }
  }, [visible, profile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfileNames(firstName, lastName);
      onSaved(updated);
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileFormModal
        visible={visible}
        title="Edit profile"
        onClose={onClose}
        footer={
          <Pressable
            onPress={() => setConfirmOpen(true)}
            className="rounded-2xl py-4 active:opacity-90"
            style={{ backgroundColor: colors.gold }}
          >
            <Text className="text-center text-base font-bold text-black">
              Save changes
            </Text>
          </Pressable>
        }
      >
        <AuthField
          autoCapitalize="words"
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <AuthField
          autoCapitalize="words"
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        {error ? (
          <Text className="text-sm" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
      </ProfileFormModal>

      <AppConfirmDialog
        visible={confirmOpen}
        title="Update profile?"
        message="Your name will be updated across SeenIt."
        confirmLabel={saving ? "Saving…" : "Update"}
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleSave()}
      />
    </>
  );
}
