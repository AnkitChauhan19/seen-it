import type { Session, User } from "@supabase/supabase-js";

import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { supabase } from "@/lib/supabase";
import {
  validateAuthPassword,
  validateGmailEmail,
  validateSignUpNames,
} from "@/lib/validation/auth";
import type { Profile } from "@/types/database";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  return message;
}

function isPermissionDenied(message: string): boolean {
  return message.toLowerCase().includes("permission denied");
}

function isMissingRpc(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "PGRST202" ||
    (error.message?.includes("Could not find the function") ?? false)
  );
}

export async function signInWithEmail({
  email,
  password,
}: SignInInput): Promise<Session> {
  const emailResult = validateGmailEmail(email);
  if (!emailResult.valid) {
    throw new Error(emailResult.message);
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw new Error(formatAuthError(error.message));
  }

  if (!data.session) {
    throw new Error("Sign in failed. Please try again.");
  }

  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();
    throw new Error("Please confirm your email before signing in.");
  }

  await ensureUserProfile(data.user);

  return data.session;
}

export async function signUpWithEmail({
  firstName,
  lastName,
  email,
  password,
}: SignUpInput): Promise<{ session: Session | null; needsEmailConfirmation: boolean }> {
  const nameResult = validateSignUpNames(firstName, lastName);
  if (!nameResult.valid) {
    throw new Error(nameResult.message);
  }

  const emailResult = validateGmailEmail(email);
  if (!emailResult.valid) {
    throw new Error(emailResult.message);
  }

  const passwordResult = validateAuthPassword(password);
  if (!passwordResult.valid) {
    throw new Error(passwordResult.message);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    },
  });

  if (error) {
    throw new Error(formatAuthError(error.message));
  }

  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    await supabase.auth.signOut();
    throw new Error(
      "This Gmail is already registered. Sign in instead. If you have not confirmed yet, use the first confirmation email or sign in after confirming.",
    );
  }

  if (data.session) {
    await ensureUserProfile(data.user);
  } else {
    await supabase.auth.signOut();
  }

  return {
    session: data.session,
    needsEmailConfirmation: !data.session,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  const { resetUserScopedQueryCache } = await import(
    "@/lib/reset-query-cache"
  );
  resetUserScopedQueryCache();
}

export async function ensureUserProfile(user: User | null): Promise<void> {
  if (!user?.email_confirmed_at) {
    return;
  }

  const { error: rpcError } = await supabase.rpc(
    "ensure_profile_for_current_user",
  );

  if (!rpcError) {
    return;
  }

  if (!isMissingRpc(rpcError) && !isPermissionDenied(rpcError.message)) {
    throw new Error(rpcError.message);
  }

  const existing = await fetchProfile(user.id);
  if (existing) {
    return;
  }

  const firstName = String(user.user_metadata?.first_name ?? "").trim();
  const lastName = String(user.user_metadata?.last_name ?? "").trim();
  const email = user.email?.toLowerCase() ?? "";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
    },
    { onConflict: "id" },
  );

  if (error && !isPermissionDenied(error.message)) {
    throw new Error(error.message);
  }
}

export async function updateProfileNames(
  firstName: string,
  lastName: string,
): Promise<Profile> {
  const nameResult = validateSignUpNames(firstName, lastName);
  if (!nameResult.valid) {
    throw new Error(nameResult.message);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be signed in.");

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: trimmedFirst,
      last_name: trimmedLast,
    })
    .eq("id", user.id);

  if (profileError) throw new Error(profileError.message);

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      first_name: trimmedFirst,
      last_name: trimmedLast,
    },
  });

  if (metaError) throw new Error(metaError.message);

  const profile = await fetchProfile(user.id);
  if (!profile) {
    throw new Error("Could not load updated profile.");
  }

  return profile;
}

export type EmailDisplayState = {
  activeEmail: string;
  pendingEmail: string | null;
};

export function getEmailDisplayState(
  user: User | null | undefined,
  fallbackEmail: string,
): EmailDisplayState {
  const activeEmail = user?.email?.trim() || fallbackEmail;
  const pendingRaw = user?.new_email?.trim();
  const pendingEmail =
    pendingRaw && pendingRaw.toLowerCase() !== activeEmail.toLowerCase()
      ? pendingRaw
      : null;

  return { activeEmail, pendingEmail };
}

/** After the user confirms a new email, sync `profiles.email` to auth. */
export async function syncProfileEmailIfConfirmed(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user?.email || user.new_email) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ email: user.email.toLowerCase() })
    .eq("id", user.id);

  if (error && !isPermissionDenied(error.message)) {
    throw new Error(error.message);
  }
}

export async function refreshAuthSessionUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return user;
}

export async function updateAccountEmail(
  email: string,
): Promise<{ pendingEmail: string }> {
  const emailResult = validateGmailEmail(email);
  if (!emailResult.valid) {
    throw new Error(emailResult.message);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be signed in.");

  const { data, error: authError } = await supabase.auth.updateUser({
    email: normalizedEmail,
  });

  if (authError) {
    throw new Error(formatAuthError(authError.message));
  }

  const pendingEmail =
    data.user?.new_email?.trim().toLowerCase() ?? normalizedEmail;

  return { pendingEmail };
}

export async function updateLoggedInPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!currentPassword) {
    throw new Error("Current password is required.");
  }

  const passwordResult = validateAuthPassword(newPassword);
  if (!passwordResult.valid) {
    throw new Error(passwordResult.message);
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("current password") ||
      lower.includes("invalid login credentials")
    ) {
      throw new Error("Current password is incorrect.");
    }
    throw new Error(formatAuthError(error.message));
  }
}

export async function deleteOwnAccount(): Promise<void> {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteOwnAccountWithPassword(
  password: string,
): Promise<void> {
  if (!password) {
    throw new Error("Password is required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user?.email) {
    throw new Error("No email found for this account.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    throw new Error("Incorrect password.");
  }

  await deleteOwnAccount();
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isPermissionDenied(error.message)) {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}
