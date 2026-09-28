import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@supabase/supabase-js";

import { ChangeEmailModal } from "@/components/profile/change-email-modal";
import { ChangePasswordModal } from "@/components/profile/change-password-modal";
import { DeleteAccountModal } from "@/components/profile/delete-account-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ProfileSettingsRow } from "@/components/profile/profile-settings-row";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";
import { AppConfirmDialog } from "@/components/ui/app-confirm-dialog";
import { AppNoticeDialog } from "@/components/ui/app-notice-dialog";
import { APP_VERSION_LABEL } from "@/constants/app-info";
import { colors } from "@/constants/theme";
import {
  fetchProfile,
  getEmailDisplayState,
  refreshAuthSessionUser,
  signOut,
  syncProfileEmailIfConfirmed,
} from "@/lib/auth-service";
import { exportUserDataSpreadsheet } from "@/lib/user-data-export";
import { useAuthStore } from "@/store/auth-store";

function SettingsDivider() {
  return (
    <View
      className="ml-[52px] h-px"
      style={{ backgroundColor: colors.border }}
    />
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSession = useAuthStore((state) => state.setSession);

  const [authUser, setAuthUser] = useState<User | null>(session?.user ?? null);
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportConfirm, setExportConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    title: string;
    message?: string;
  } | null>(null);

  const profileEmail = profile?.email ?? "";
  const { activeEmail, pendingEmail } = getEmailDisplayState(
    authUser,
    session?.user.email ?? profileEmail,
  );

  const emailSubtitle = pendingEmail
    ? `Pending: ${pendingEmail}`
    : activeEmail;

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : session?.user.email?.split("@")[0] ?? "User";

  const initials = profile
    ? `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase()
    : session?.user.email?.[0]?.toUpperCase() ?? "?";

  const showNotice = (title: string, message?: string) => {
    setNotice({ title, message });
  };

  const refreshAuthAndProfile = useCallback(async () => {
    try {
      const user = await refreshAuthSessionUser();
      if (user) {
        setAuthUser(user);
        if (session) {
          setSession({ ...session, user });
        }
      }
      await syncProfileEmailIfConfirmed();
      const userId = user?.id ?? session?.user.id;
      if (userId) {
        const next = await fetchProfile(userId);
        setProfile(next);
      }
    } catch {
      // Non-blocking on profile screen.
    }
  }, [session, setProfile, setSession]);

  useEffect(() => {
    void refreshAuthAndProfile();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshAuthAndProfile();
      }
    });
    return () => sub.remove();
  }, [refreshAuthAndProfile]);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      setSignOutConfirm(false);
      router.replace("/login");
    } catch (err) {
      showNotice(
        "Sign out failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleted = async () => {
    setDeleteOpen(false);
    await signOut();
    router.replace("/login");
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await exportUserDataSpreadsheet();
      setExportConfirm(false);
      showNotice(
        "Export ready",
        "Use the share sheet to save the Excel file or open it in another app.",
      );
    } catch (err) {
      showNotice(
        "Export failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="pt-4 text-3xl font-bold" style={{ color: colors.text }}>
          Profile
        </Text>

        <View className="mt-8 flex-row items-stretch gap-4">
          <View
            className="h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{ backgroundColor: colors.gold }}
          >
            <Text className="text-2xl font-bold text-black">{initials}</Text>
          </View>

          <View className="flex-1 justify-center py-0.5">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {fullName}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              {activeEmail}
            </Text>
            {pendingEmail ? (
              <Text className="mt-1 text-xs" style={{ color: colors.gold }}>
                Confirm new email: {pendingEmail}
              </Text>
            ) : null}
          </View>
        </View>

        <ProfileSettingsSection title="Account">
          <ProfileSettingsRow
            icon="person-outline"
            title="Edit Profile"
            subtitle="First and last name"
            onPress={() => setEditOpen(true)}
          />
          <SettingsDivider />
          <ProfileSettingsRow
            icon="mail-outline"
            title="Change Email"
            subtitle={emailSubtitle}
            onPress={() => setEmailOpen(true)}
          />
          <SettingsDivider />
          <ProfileSettingsRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => setPasswordOpen(true)}
          />
          <SettingsDivider />
          <ProfileSettingsRow
            icon="download-outline"
            title="Export Data"
            subtitle="Library, Theatres & Watchlist (.xlsx)"
            showChevron={false}
            onPress={() => setExportConfirm(true)}
          />
          <SettingsDivider />
          <ProfileSettingsRow
            icon="log-out-outline"
            title="Sign Out"
            showChevron={false}
            onPress={() => setSignOutConfirm(true)}
          />
          <SettingsDivider />
          <ProfileSettingsRow
            icon="trash-outline"
            title="Delete Account"
            destructive
            onPress={() => setDeleteOpen(true)}
          />
        </ProfileSettingsSection>

        <ProfileSettingsSection title="About">
          <ProfileSettingsRow
            icon="time-outline"
            title="Version"
            value={APP_VERSION_LABEL}
          />
        </ProfileSettingsSection>
      </ScrollView>

      <EditProfileModal
        visible={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setProfile(updated);
          showNotice("Profile updated");
        }}
      />

      <ChangeEmailModal
        visible={emailOpen}
        currentEmail={activeEmail}
        pendingEmail={pendingEmail}
        onClose={() => setEmailOpen(false)}
        onRequested={(nextPending) => {
          void refreshAuthAndProfile();
          showNotice(
            "Confirm your new email",
            `We sent a confirmation link to ${nextPending}. Your sign-in email stays ${activeEmail} until you confirm.`,
          );
        }}
      />

      <ChangePasswordModal
        visible={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSaved={() => showNotice("Password updated")}
      />

      <DeleteAccountModal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => void handleDeleted()}
      />

      <AppConfirmDialog
        visible={exportConfirm}
        title="Export your data?"
        message="Creates an Excel file with Library, Theatres, and Watchlist sheets."
        confirmLabel={exporting ? "Exporting…" : "Export"}
        loading={exporting}
        onCancel={() => setExportConfirm(false)}
        onConfirm={() => void handleExportData()}
      />

      <AppConfirmDialog
        visible={signOutConfirm}
        title="Sign out?"
        message="You'll need to sign in again to use SeenIt."
        confirmLabel="Sign out"
        loading={busy}
        onCancel={() => setSignOutConfirm(false)}
        onConfirm={() => void handleSignOut()}
      />

      <AppNoticeDialog
        visible={notice !== null}
        title={notice?.title ?? ""}
        message={notice?.message}
        onConfirm={() => setNotice(null)}
        onClose={() => setNotice(null)}
      />
    </SafeAreaView>
  );
}
