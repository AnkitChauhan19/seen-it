import * as Linking from "expo-linking";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { ensureUserProfile, fetchProfile } from "@/lib/auth-service";
import {
  createSessionFromUrl,
  isAuthCallbackUrl,
} from "@/lib/auth-deep-link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (userId: string) => {
      try {
        const profile = await fetchProfile(userId);
        if (isMounted) {
          setProfile(profile);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) {
        return;
      }
      setSession(session);
      if (session?.user.id) {
        void loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user.id) {
        void ensureUserProfile(session.user)
          .then(() => loadProfile(session.user.id))
          .catch(() => {
            if (isMounted) {
              setProfile(null);
            }
          });
      } else {
        setProfile(null);
      }
    });

    const handleAuthDeepLink = async (url: string | null) => {
      if (!url || !isAuthCallbackUrl(url)) {
        return;
      }

      try {
        await createSessionFromUrl(url);
      } catch {
        // Callback screen shows detailed errors when routed there.
      }
    };

    void Linking.getInitialURL().then(handleAuthDeepLink);

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleAuthDeepLink(url);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [setInitialized, setProfile, setSession]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  return children;
}
