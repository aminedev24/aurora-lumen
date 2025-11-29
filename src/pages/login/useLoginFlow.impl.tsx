import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TFunction } from "i18next";
import {
  applyVerifiedSession,
  fetchWebProfile,
  loginWebWithPassword,
  RequestWebLoginInfo,
  requestWebLoginCode,
  setWebPassword,
  updateStoredWebUser,
  useWebAuth,
  verifyWebLoginCode,
} from "@/lib/webAuth";
import { useAuthStore } from "@/stores/authStore";
import { buildVerificationBanner } from "./helpers/verificationBanner";
import {
  readPasswordPreference,
  writePasswordPreference,
  loadRememberEmailFlag,
  persistRememberEmailFlag,
  loadLastEmail,
  storeLastEmail,
} from "./helpers/storage";
import { useGoogleSignIn } from "./hooks/useGoogleSignIn";

const MIN_PASSWORD_LENGTH = 8;

type UseLoginFlowArgs = {
  t: TFunction<"translation", undefined>;
};

export function useLoginFlow({ t }: UseLoginFlowArgs) {
  const query = new URLSearchParams(window.location.search);
  const startMode = query.get("mode");
  const nextPath = query.get("next") || "/account";

  const [isRegister, setIsRegister] = useState(startMode === "register");
  const [signinMethod, setSigninMethod] = useState<"password" | "code">(() => {
    if (startMode === "register") {
      return "code";
    }
    return readPasswordPreference() ? "password" : "code";
  });
  const [step, setStep] = useState<"request" | "verify" | "set-password">("request");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [passwordEmail, setPasswordEmail] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [verificationInfo, setVerificationInfo] = useState<RequestWebLoginInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);
  const [postVerifyPassword, setPostVerifyPassword] = useState("");
  const [postVerifyConfirm, setPostVerifyConfirm] = useState("");
  const [postVerifyError, setPostVerifyError] = useState<string | null>(null);
  const [postVerifyLoading, setPostVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useWebAuth();
  const setAppUser = useAuthStore((s) => s.setUser);
  const { googleLoading, handleGoogleSignIn } = useGoogleSignIn({
    t,
    navigate,
    nextPath,
    setAppUser,
    setStatus,
    setError,
  });
  const verificationBanner = buildVerificationBanner(t, verificationInfo);

  useEffect(() => {
    const shouldRemember = loadRememberEmailFlag();
    setRememberEmail(shouldRemember);
    if (shouldRemember) {
      const storedEmail = loadLastEmail();
      if (storedEmail) {
        setEmail((prev) => (prev ? prev : storedEmail));
        setPasswordEmail((prev) => (prev ? prev : storedEmail));
      }

      // Load saved login credentials if user opted in
      const savedCreds = localStorage.getItem("aurora_saved_login");
      if (savedCreds) {
        try {
          const { email, password } = JSON.parse(savedCreds);
          setPasswordEmail(email);
          setPasswordValue(password);
          setRememberLogin(true);
        } catch (e) {
          // Invalid stored data, ignore
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  useEffect(() => {
    if (step === "verify" && codeRef.current) {
      codeRef.current.focus();
    }
    if (step === "request" && emailRef.current) {
      emailRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const resetFlow = useCallback(() => {
    setStep("request");
    setPendingEmail("");
    setPendingName("");
    setCode("");
    setResendCooldown(0);
    setError(null);
    setStatus(null);
    setLoading(false);
    setVerificationInfo(null);
    setPostVerifyPassword("");
    setPostVerifyConfirm("");
    setPostVerifyError(null);
    setPostVerifyLoading(false);
  }, []);

  const handleModeToggle = useCallback(() => {
    setIsRegister((prev) => {
      const next = !prev;
      setSigninMethod(next ? "code" : readPasswordPreference() ? "password" : "code");
      return next;
    });
    resetFlow();
  }, [resetFlow]);

  const persistLastEmail = useCallback(
    (value?: string | null) => {
      if (rememberEmail && value) {
        storeLastEmail(value);
      } else if (!rememberEmail) {
        storeLastEmail(null);
      }
    },
    [rememberEmail]
  );

  const handleRequestCode = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setStatus(null);

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError(t("auth.web.invalidEmail", "Please enter a valid email address."));
        return;
      }

      const trimmedName = name.trim();

      try {
        setLoading(true);
        const info = await requestWebLoginCode({
          email: trimmedEmail,
          name: isRegister && trimmedName ? trimmedName : undefined,
          flow: isRegister ? "register" : "login",
        });

        setVerificationInfo(info ?? null);
        setPendingEmail(trimmedEmail);
        setPendingName(trimmedName);
        setStep("verify");
        setCode("");
        setResendCooldown(45);
        setPasswordEmail(trimmedEmail);
        setStatus(
          t("auth.web.requestSuccess", "We sent a 6-digit code to {{email}}.", {
            email: trimmedEmail,
          })
        );
        persistLastEmail(trimmedEmail);
      } catch (err: any) {
        console.error("[login] request code failed", err);
        const message =
          typeof err?.message === "string" && err.message
            ? err.message
            : t("auth.web.requestError", "Unable to send the code. Please try again.");
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, name, isRegister, t, persistLastEmail]
  );

  const handleVerify = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setStatus(null);

      const trimmedCode = code.trim();
      if (!trimmedCode || trimmedCode.length < 4) {
        setError(t("auth.web.invalidCode", "Please enter the code from your email."));
        return;
      }

      try {
        setLoading(true);
        const response = await verifyWebLoginCode({
          email: pendingEmail,
          code: trimmedCode,
          name: pendingName || undefined,
        });

        applyVerifiedSession(response);

        try {
          const profile = await fetchWebProfile(response.access_token);
          updateStoredWebUser(profile.user);
        } catch (profileErr) {
          console.warn("[login] profile refresh failed, using verify payload", profileErr);
          updateStoredWebUser(response.user);
        }

        persistLastEmail(pendingEmail);

        const needsPasswordSetup = !response.user?.password_enabled;
        if (needsPasswordSetup) {
          setStep("set-password");
          setPostVerifyPassword("");
          setPostVerifyConfirm("");
          setPostVerifyError(null);
          setStatus(
            t(
              "auth.web.setPasswordPrompt",
              "Create a password now so you can sign in without codes."
            )
          );
          return;
        }

        setStatus(t("auth.web.verifySuccess", "Verified! Redirecting to your account…"));
        setTimeout(() => {
          navigate(nextPath, { replace: true });
        }, 800);
      } catch (err: any) {
        console.error("[login] verify failed", err);
        const message =
          typeof err?.message === "string" && err.message
            ? err.message
            : t("auth.web.verifyError", "That code didn’t work. Double-check and try again.");
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      code,
      pendingEmail,
      pendingName,
      navigate,
      nextPath,
      t,
      persistLastEmail,
      fetchWebProfile,
      updateStoredWebUser,
    ]
  );

  const handlePasswordLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setStatus(null);

      const trimmedEmail = passwordEmail.trim().toLowerCase();
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError(t("auth.web.invalidEmail", "Please enter a valid email address."));
        return;
      }

      if (!passwordValue || passwordValue.length < MIN_PASSWORD_LENGTH) {
        setError(
          t("auth.web.passwordTooShort", "Passwords need at least {{count}} characters.", {
            count: MIN_PASSWORD_LENGTH,
          })
        );
        return;
      }

      try {
        setLoading(true);
        
        // Save login if "Remember me" is checked
        if (rememberLogin) {
          try {
            localStorage.setItem(
              "aurora_saved_login",
              JSON.stringify({
                email: trimmedEmail,
                password: passwordValue,
              })
            );
          } catch (e) {
            // Ignore storage errors
          }
        } else {
          // Clear saved login if unchecked
          localStorage.removeItem("aurora_saved_login");
        }
        
        const response = await loginWebWithPassword({
          email: trimmedEmail,
          password: passwordValue,
        });

        applyVerifiedSession(response);
        try {
          const profile = await fetchWebProfile(response.access_token);
          updateStoredWebUser(profile.user);
        } catch (profileErr) {
          console.warn("[login] profile refresh failed after password login", profileErr);
          updateStoredWebUser(response.user);
        }

        persistLastEmail(trimmedEmail);
        writePasswordPreference(true);

        setStatus(t("auth.web.passwordSuccess", "Welcome back! Redirecting to your account…"));
        setTimeout(() => {
          navigate(nextPath, { replace: true });
        }, 600);
      } catch (err: any) {
        console.error("[login] password sign-in failed", err);
        const message =
          typeof err?.message === "string" && err.message
            ? err.message
            : t("auth.web.passwordError", "We couldn’t sign you in with that password.");
        if (message.toLowerCase().includes("not enabled")) {
          setError(null);
          setStatus(
            t(
              "auth.web.passwordNotEnabled",
              "Looks like this account hasn’t set a password yet. Use the magic link tab to get a one-time code, sign in once, then set a password from your account page."
            )
          );
          setEmail(trimmedEmail);
          setStep("request");
          setSigninMethod("code");
          writePasswordPreference(false);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      passwordEmail,
      passwordValue,
      navigate,
      nextPath,
      persistLastEmail,
      t,
      fetchWebProfile,
      updateStoredWebUser,
    ]
  );

  const handleResend = useCallback(async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    try {
      setLoading(true);
      setError(null);
      const info = await requestWebLoginCode({
        email: pendingEmail,
        name: pendingName || undefined,
      });
      if (info) {
        setVerificationInfo(info);
      }
      setStatus(t("auth.web.resendSuccess", "Sent! Check your inbox for the newest code."));
      setResendCooldown(45);
    } catch (err: any) {
      console.error("[login] resend failed", err);
      const message =
        typeof err?.message === "string" && err.message
          ? err.message
          : t("auth.web.requestError", "Unable to send the code. Please try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pendingEmail, pendingName, resendCooldown, t]);

  const handleUseDifferentEmail = useCallback(() => {
    setEmail(pendingEmail);
    resetFlow();
  }, [pendingEmail, resetFlow]);

  const handleRememberToggle = useCallback(() => {
    setRememberEmail((prev) => {
      const next = !prev;
      persistRememberEmailFlag(next);
      if (!next) {
        storeLastEmail(null);
      } else {
        const candidate = passwordEmail || email;
        if (candidate) {
          storeLastEmail(candidate);
        }
      }
      return next;
    });
  }, [email, passwordEmail]);

  const handlePostVerifyPasswordSave = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setPostVerifyError(null);
      if (postVerifyPassword.length < MIN_PASSWORD_LENGTH) {
        setPostVerifyError(
          t("auth.web.passwordTooShort", "Passwords need at least {{count}} characters.", {
            count: MIN_PASSWORD_LENGTH,
          })
        );
        return;
      }
      if (postVerifyPassword !== postVerifyConfirm) {
        setPostVerifyError(t("auth.web.passwordMismatch", "Passwords must match."));
        return;
      }
      try {
        setPostVerifyLoading(true);
        await setWebPassword(postVerifyPassword);
        try {
          const profile = await fetchWebProfile();
          updateStoredWebUser(profile.user);
        } catch (profileErr) {
          console.warn("[login] profile refresh failed after password setup", profileErr);
        }
        writePasswordPreference(true);
        setStatus(t("auth.web.passwordSetupSuccess", "Password saved! Redirecting…"));
        setTimeout(() => {
          navigate(nextPath, { replace: true });
        }, 700);
      } catch (err: any) {
        console.error("[login] password setup failed", err);
        setPostVerifyError(
          typeof err?.message === "string" && err.message
            ? err.message
            : t("auth.web.passwordUpdateError", "Unable to save your password right now.")
        );
      } finally {
        setPostVerifyLoading(false);
      }
    },
    [
      fetchWebProfile,
      navigate,
      nextPath,
      postVerifyConfirm,
      postVerifyPassword,
      t,
      updateStoredWebUser,
    ]
  );

  const handleSkipPasswordSetup = useCallback(() => {
    navigate(nextPath, { replace: true });
  }, [navigate, nextPath]);

  const requestButtonLabel = loading
    ? t("auth.web.sending", "Sending code…")
    : isRegister
    ? t("auth.web.registerCta", "Start my trial")
    : t("auth.web.loginCta", "Send sign-in code");

  const verifyButtonLabel = loading
    ? t("auth.web.verifying", "Verifying…")
    : t("auth.web.verifyButton", "Verify and continue");

  const verifyPrompt = t("auth.web.verifyPrompt", "Enter the 6-digit code sent to {{email}}", {
    email: pendingEmail,
  });

  const goToResetPassword = useCallback(() => {
    navigate("/reset-password");
  }, [navigate]);

  return {
    isRegister,
    signinMethod,
    setSigninMethod,
    step,
    email,
    setEmail,
    name,
    setName,
    code,
    setCode,
    passwordEmail,
    setPasswordEmail,
    passwordValue,
    setPasswordValue,
    rememberEmail,
    handleRememberToggle,
    pendingEmail,
    loading,
    resendCooldown,
    error,
    status,
    requestButtonLabel,
    verifyButtonLabel,
    verifyPrompt,
    verificationBanner,
    handleRequestCode,
    handleVerify,
    handlePasswordLogin,
    handleResend,
    handleUseDifferentEmail,
    handleModeToggle,
    goToResetPassword,
    handleGoogleSignIn,
    googleLoading,
    emailRef,
    codeRef,
    postVerifyPassword,
    setPostVerifyPassword,
    postVerifyConfirm,
    setPostVerifyConfirm,
    postVerifyError,
    postVerifyLoading,
    handlePostVerifyPasswordSave,
    handleSkipPasswordSetup,
    showPassword,
    setShowPassword,
    rememberLogin,
    setRememberLogin,
  };
}

export type LoginFlowState = ReturnType<typeof useLoginFlow>;
