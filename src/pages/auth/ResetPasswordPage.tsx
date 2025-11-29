// ==============================================================================
// File: /frontend/src/pages/ResetPasswordPage.tsx
// Description: Password reset page (enter new password after email link)
// ==============================================================================

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPassword } from "@/lib/api";
import "@/pages/home/HomePage.css";
import "./index.css"; // ✅ Modular auth styles
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("auth.passwordMismatch", "Passwords do not match."));
      return;
    }
    try {
      setLoading(true);
      await resetPassword(token, password, confirm);
      setSuccess(true);
      setTimeout(() => navigate("/login?mode=login", { replace: true }), 2000);
    } catch (err: any) {
      setError(err.message || t("auth.requestFailed", "Request failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing reset-page">
      <TopBar />

      <div className="reset-layout">
        <section className="reset-card">
          <h1>{t("auth.resetTitle", "Reset Password")}</h1>
          <p className="reset-copy">
            {t("auth.resetSubtitle", "Enter a new password to secure your Aurora account.")}
          </p>

          <form className="reset-form" onSubmit={handleSubmit}>
            {error && <div className="reset-error">{error}</div>}
            {success && (
              <div className="reset-success">
                ✅ {t("auth.resetSuccess", "Password updated. Redirecting to login...")}
              </div>
            )}

            <label className="reset-field">
              <span>{t("auth.password", "Password")}</span>
              <input
                type="password"
                className="reset-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            <label className="reset-field">
              <span>{t("auth.confirmPassword", "Confirm Password")}</span>
              <input
                type="password"
                className="reset-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <button type="submit" className="reset-submit" disabled={loading}>
              {loading
                ? t("auth.processing", "Processing...")
                : t("auth.resetConfirm", "Reset")}
            </button>

            <button
              type="button"
              className="reset-secondary"
              onClick={() => navigate("/login?mode=login")}
            >
              {t("auth.backToLogin", "Back to sign in")}
            </button>
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
}

