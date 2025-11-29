import { useState, useEffect, useCallback } from "react";
import type { TFunction } from "i18next";
import { useNavigate } from "react-router-dom";
import { getGoogleConfig, loginWithGoogle } from "@/lib/api";
import { getGoogleIdToken } from "@/lib/google";
import type { WebUser } from "@/stores/authStore";

type UseGoogleSignInArgs = {
  t: TFunction<"translation", undefined>;
  navigate: ReturnType<typeof useNavigate>;
  nextPath: string;
  setAppUser: (user: WebUser | null, token: string | null, sessionId?: string | null) => void;
  setStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useGoogleSignIn({
  t,
  navigate,
  nextPath,
  setAppUser,
  setStatus,
  setError,
}: UseGoogleSignInArgs) {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGoogleConfig()
      .then((config) => {
        if (!cancelled) setGoogleClientId(config?.client_id ?? null);
      })
      .catch(() => {
        if (!cancelled) setGoogleClientId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setStatus(null);
    setGoogleLoading(true);
    try {
      let clientId = googleClientId;
      if (!clientId) {
        const config = await getGoogleConfig();
        clientId = config?.client_id ?? null;
        setGoogleClientId(clientId);
      }
      if (!clientId) {
        throw new Error(t("auth.web.googleUnavailable", "Google sign-in is unavailable right now."));
      }
      const idToken = await getGoogleIdToken(clientId);
      const response = await loginWithGoogle(idToken);
      if (!response?.user || !response?.access_token) {
        throw new Error(t("auth.web.googleFailed", "Unable to sign in with Google. Try again."));
      }
      setAppUser(response.user, response.access_token, response.session?.session_id);
      setStatus(t("auth.web.googleSuccess", "Signed in with Google. Redirecting…"));
      setTimeout(() => {
        navigate(nextPath, { replace: true });
      }, 600);
    } catch (err: any) {
      console.error("[login] google sign-in failed", err);
      setError(err?.message || t("auth.web.googleFailed", "Unable to sign in with Google. Try again."));
    } finally {
      setGoogleLoading(false);
    }
  }, [googleClientId, navigate, nextPath, setAppUser, setError, setStatus, t]);

  return { googleLoading, handleGoogleSignIn };
}
