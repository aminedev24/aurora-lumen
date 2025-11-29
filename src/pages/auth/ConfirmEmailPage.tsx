// ==============================================================================
// File: /frontend/src/pages/ConfirmEmailPage.tsx
// Description: Handles email confirmation links for the web account.
// ==============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import "@/pages/home/HomePage.css";
import "./ConfirmEmailPage.css";
import { confirmEmailToken, useWebAuth } from "@/lib/webAuth";

export default function ConfirmEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const { isAuthenticated } = useWebAuth();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage(t("confirmEmail.missingToken", "Confirmation token not provided."));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading");
        const response = await confirmEmailToken(token);
        if (cancelled) return;
        setResolvedEmail(response.email);
        setStatus("success");
        setMessage(
          t("confirmEmail.success", "Email confirmed! You now have access to Standard features.")
        );
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err?.message ||
            t(
              "confirmEmail.error",
              "We couldn't confirm that link. It may have expired—request a new one from the registration flow."
            )
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const handleRequestAnother = useCallback(() => {
    navigate("/login?mode=register");
  }, [navigate]);

  const headline = useMemo(() => {
    if (status === "success") return t("confirmEmail.verified", "Email verified");
    if (status === "error") return t("confirmEmail.problem", "Something went wrong");
    if (status === "loading") return t("confirmEmail.processing", "Confirming your email");
    return t("confirmEmail.instructions", "Check your email for the confirmation link");
  }, [status, t]);

  return (
    <div className="landing home-v2">
      <TopBar />
      <main className="confirm-email-page">
        <section className="confirm-email-card">
          <header>
            <h1>{headline}</h1>
            {resolvedEmail && status === "success" ? (
              <p className="confirm-email-note">{resolvedEmail}</p>
            ) : null}
          </header>

          <div className="confirm-email-state">
            {status === "loading" && (
              <p>
                <Loader2 className="spin" size={22} aria-hidden="true" />
                {t("confirmEmail.loading", "Hang tight, we’re confirming your email…")}
              </p>
            )}
            {status === "success" && (
              <p>
                <CheckCircle2 size={22} aria-hidden="true" color="#16a34a" />
                {message ||
                  t(
                    "confirmEmail.successFallback",
                    "Email confirmed! We’ve saved your badge so future sign-ins can use passwords or magic links."
                  )}
              </p>
            )}
            {status === "error" && (
              <p>
                <AlertTriangle size={22} aria-hidden="true" color="#f97316" />
                {message}
              </p>
            )}
            {status === "idle" && (
              <p>{t("confirmEmail.help", "Paste the link we emailed you to finish confirming your account.")}</p>
            )}
          </div>

          <div className="confirm-email-actions">
            <button
              type="button"
              className="hp-btn hp-btn--primary"
              onClick={() => navigate(isAuthenticated ? "/account" : "/login")}
            >
              {isAuthenticated
                ? t("confirmEmail.goToAccount", "Go to my account")
                : t("confirmEmail.backToLogin", "Back to login")}
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="confirm-email-hint">
            {t(
              "confirmEmail.onceOnly",
              "You only have to confirm once during Standard signup. Prefer a fresh code or link?"
            )}{" "}
            <button type="button" onClick={handleRequestAnother}>
              {t("confirmEmail.requestNew", "Request another")}
            </button>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
