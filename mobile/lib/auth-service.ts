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
