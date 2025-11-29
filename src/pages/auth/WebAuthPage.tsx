// ==============================================================================
// File: /frontend/src/pages/WebAuthPage.tsx
// Description: Public web authentication flow for email code sign-in & sign-up.
// ==============================================================================

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import {
  applyVerifiedSession,
  fetchWebProfile,
  requestWebLoginCode,
  updateStoredWebUser,
  useWebAuth,
  verifyWebLoginCode,
} from "@/lib/webAuth";

import "./WebAuthPage.css";

type WebAuthMode = "login" | "register";

type WebAuthPageProps = {
  mode: WebAuthMode;
};

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function WebAuthPage({ mode }: WebAuthPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useWebAuth();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const codeRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const oppositeModePath = mode === "login" ? "/register" : "/login";
  const oppositeModeLabel =
    mode === "login"
      ? t("auth.web.needAccount", "Need an account? Sign up")
      : t("auth.web.haveAccount", "Already have an account? Sign in");

  const headline = mode === "login"
    ? t("auth.web.loginHeadline", "Sign in to Aurora")
    : t("auth.web.registerHeadline", "Create your Aurora account");

  const blurb = mode === "login"
    ? t(
        "auth.web.loginBlurb",
        "Enter your email address and we'll send a secure sign-in code. No password required."
      )
    : t(
        "auth.web.registerBlurb",
        "Tell us where to send your magic code. New accounts start on the Standard plan with a 7-day free trial."
      );

  const verifyPrompt = useMemo(
    () =>
      t(
        "auth.web.verifyPrompt",
        "Enter the 6-digit code we sent to {{email}}",
        { email: pendingEmail }
      ),
    [pendingEmail, t]
  );

  useEffect(() => {
    if (isAuthenticated) {
      const search = new URLSearchParams(location.search);
      const redirect = search.get("next") || "/account";
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, location.search]);

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

  const resetToRequest = useCallback(() => {
    setStep("request");
    setPendingEmail("");
    setPendingName("");
    setCode("");
    setError(null);
    setStatus(null);
    setResendCooldown(0);
  }, []);

  const handleRequestCode = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setStatus(null);

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        setError(t("auth.web.invalidEmail", "Please enter a valid email address."));
        return;
      }

      const trimmedName = name.trim();

      try {
        setLoading(true);
        await requestWebLoginCode({
          email: trimmedEmail,
          name: mode === "register" && trimmedName ? trimmedName : undefined,
        });

        setPendingEmail(trimmedEmail);
        setPendingName(trimmedName);
        setStep("verify");
        setCode("");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setStatus(
          t(
            "auth.web.requestSuccess",
            "Code sent! It may take a minute to reach your inbox."
          )
        );
      } catch (requestError: any) {
        console.error("[web-auth] request code failed", requestError);
        const message =
          typeof requestError?.message === "string" && requestError.message
            ? requestError.message
            : t("auth.web.requestError", "Unable to send the code. Please try again.");
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, name, mode, t]
  );

  const handleResend = useCallback(async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    try {
      setLoading(true);
      setError(null);
      await requestWebLoginCode({
        email: pendingEmail,
        name: pendingName || undefined,
      });
      setStatus(
        t("auth.web.resendSuccess", "Sent! Check your inbox for the newest code.")
      );
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      console.error("[web-auth] resend failed", err);
      const message =
        typeof err?.message === "string" && err.message
          ? err.message
          : t("auth.web.requestError", "Unable to send the code. Please try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pendingEmail, pendingName, resendCooldown, t]);

  const handleVerify = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
          const latest = await fetchWebProfile(response.access_token);
          updateStoredWebUser(latest.user);
        } catch (profileErr) {
          console.warn("[web-auth] profile refresh failed, using verify payload", profileErr);
          updateStoredWebUser(response.user);
        }

        setStatus(t("auth.web.verifySuccess", "You’re all set! Redirecting to your account…"));
        setTimeout(() => {
          navigate("/account", { replace: true });
        }, 800);
      } catch (verifyError: any) {
        console.error("[web-auth] verify failed", verifyError);
        const message =
          typeof verifyError?.message === "string" && verifyError.message
            ? verifyError.message
            : t(
                "auth.web.verifyError",
                "That code didn’t work. Double-check and try again."
              );
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [code, pendingEmail, pendingName, navigate, t]
  );

  const renderRequestStep = () => (
    <form className="web-auth-form" onSubmit={handleRequestCode}>
      <label htmlFor="web-auth-email">
        {t("auth.web.emailLabel", "Email address")}
      </label>
      <div className="web-auth-input">
        <Mail size={16} aria-hidden="true" />
        <input
          id="web-auth-email"
          ref={emailRef}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("auth.web.emailPlaceholder", "you@example.com")}
          required
        />
      </div>

      {mode === "register" && (
        <>
          <label htmlFor="web-auth-name">
            {t("auth.web.nameLabel", "Name (optional)")}
          </label>
          <div className="web-auth-input">
            <ShieldCheck size={16} aria-hidden="true" />
            <input
              id="web-auth-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.web.namePlaceholder", "How should Aurora greet you?")}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="web-auth-submit"
        disabled={loading}
      >
        {loading
          ? t("auth.web.sending", "Sending code…")
          : t("auth.web.sendCode", "Send sign-in code")}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );

  const renderVerifyStep = () => (
    <form className="web-auth-form" onSubmit={handleVerify}>
      <label htmlFor="web-auth-code">
        {verifyPrompt}
      </label>
      <input
        id="web-auth-code"
        ref={codeRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        value={code}
        onChange={(event) => {
          const next = event.target.value.replace(/\D+/g, "").slice(0, CODE_LENGTH);
          setCode(next);
        }}
        placeholder={t("auth.web.codePlaceholder", "000000")}
        className="web-auth-code-input"
      />

      <div className="web-auth-actions">
        <button
          type="submit"
          className="web-auth-submit"
          disabled={loading || code.length === 0}
        >
          {loading
            ? t("auth.web.verifying", "Verifying…")
            : t("auth.web.verifyButton", "Verify and continue")}
          <CheckCircle2 size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="web-auth-resend"
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
        >
          {resendCooldown > 0
            ? t("auth.web.resendCountdown", "Resend in {{seconds}}s", {
                seconds: resendCooldown,
              })
            : t("auth.web.resendNow", "Resend code")}
        </button>
      </div>

      <button
        type="button"
        className="web-auth-back"
        onClick={resetToRequest}
      >
        {t("auth.web.useDifferentEmail", "Use a different email")}
      </button>
    </form>
  );

  return (
    <div className="landing home-v2 web-auth-page">
      <TopBar />

      <main className="web-auth-body">
        <section className="web-auth-card">
          <header>
            <h1>{headline}</h1>
            <p>{blurb}</p>
          </header>

          {error && <div className="web-auth-alert error">{error}</div>}
          {status && <div className="web-auth-alert success">{status}</div>}

          {step === "request" ? renderRequestStep() : renderVerifyStep()}

          <footer className="web-auth-footer">
            <Link to={oppositeModePath}>{oppositeModeLabel}</Link>
          </footer>
        </section>

        <aside className="web-auth-sidebar">
          <div className="web-auth-benefits">
            <h2>{t("auth.web.benefitsTitle", "What you get")}</h2>
            <ul>
              <li>{t("auth.web.benefit1", "7-day Standard trial with unlimited conversations")}</li>
              <li>{t("auth.web.benefit2", "Switch between Free and Plus plans anytime")}</li>
              <li>{t("auth.web.benefit3", "No passwords to remember—secure codes only")}</li>
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
