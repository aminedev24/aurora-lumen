import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import { performWebLogout, revokeOtherWebSessions, useWebAuth } from "@/lib/webAuth";
import { WebAccountContent } from "./WebAccountContent";
import { ImpersonationBanner } from "./ImpersonationBanner";
import type { EditableFields, TrialSummary } from "./types";
import { useAccountBridge } from "@/shared/accountBridge/useAccountBridge";

import "./WebAccountPage.css";

const MIN_WEB_PASSWORD_LENGTH = 8;
const PAYPAL_PLUS_URL = "https://www.paypal.com/ncp/payment/XJA289VJJUSSY";

const PLAN_COPY: Record<string, { title: string; bullets: string[] }> = {
  standard: {
    title: "Standard",
    bullets: [
      "7-day Aurora Plus trial with unlimited tokens on sign-up",
      "Aurora Plus toolkit with a fair daily token cap afterwards",
      "Priority queue for new AI features",
    ],
  },
  plus: {
    title: "Aurora Plus",
    bullets: [
      "Always-on priority compute and highest token limits",
      "Workspace collaboration and export-ready contexts",
      "Dedicated support and early feature previews",
    ],
  },
};

export default function WebAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, expiresAt: authExpires, user: webAuthUser } = useWebAuth();

  const normalizedRoles = useMemo(() => {
    const raw = webAuthUser?.roles;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((role) => (typeof role === "string" ? role.trim().toLowerCase() : ""))
      .filter(Boolean);
  }, [webAuthUser?.roles]);
  const singleRole = typeof webAuthUser?.role === "string" ? webAuthUser.role.trim().toLowerCase() : "";
  const ownerFlag =
    normalizedRoles.includes("owner") ||
    singleRole === "owner" ||
    Boolean(webAuthUser?.is_owner || webAuthUser?.isOwner);
  const adminFlag =
    normalizedRoles.includes("admin") ||
    singleRole === "admin" ||
    Boolean(webAuthUser?.is_admin || webAuthUser?.isAdmin);
  const isOwner = ownerFlag;
  const isAdmin = ownerFlag || adminFlag;

  const {
    loading: bridgeLoading,
    error: bridgeError,
    profile: bridgeProfile,
    planKey: currentPlanKey,
    trialSummary,
    sessionExpiresAt,
    verification,
    refresh,
    updateProfile,
    updatePassword,
  } = useAccountBridge();

  const [formFields, setFormFields] = useState<EditableFields>({
    name: bridgeProfile?.name ?? "",
    firstName: bridgeProfile?.firstName ?? "",
    email: bridgeProfile?.email ?? "",
    phone: bridgeProfile?.phone ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordFields, setPasswordFields] = useState({ password: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/account", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (bridgeProfile) {
      setFormFields({
        name: bridgeProfile.name,
        firstName: bridgeProfile.firstName,
        email: bridgeProfile.email,
        phone: bridgeProfile.phone,
      });
    }
  }, [bridgeProfile]);

  useEffect(() => {
    setLoading(bridgeLoading);
  }, [bridgeLoading]);

  const handleFieldChange =
    (field: keyof EditableFields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormFields((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handlePasswordFieldChange =
    (field: "password" | "confirm") => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPasswordFields((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSave = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setSaving(true);
      setError(null);
      setActionMessage(null);
      try {
        await updateProfile({
          name: formFields.name,
          phone: formFields.phone,
        });
        setActionMessage("Profile updated successfully.");
      } catch (err: any) {
        console.error("[web-account] profile update failed", err);
        const message =
          typeof err?.message === "string" && err.message
            ? err.message
            : "We couldn't update your profile. Please try again.";
        setError(message);
      } finally {
        setSaving(false);
      }
    },
    [formFields.name, formFields.phone, updateProfile]
  );

  const handlePasswordSave = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setPasswordSaving(true);
      setPasswordError(null);
      setPasswordMessage(null);

      if (!passwordFields.password || passwordFields.password.length < MIN_WEB_PASSWORD_LENGTH) {
        setPasswordError(
          t("account.web.passwordTooShort", "Please use at least {{count}} characters.", { count: MIN_WEB_PASSWORD_LENGTH })
        );
        setPasswordSaving(false);
        return;
      }
      if (passwordFields.password !== passwordFields.confirm) {
        setPasswordError(t("account.web.passwordMismatch", "The passwords do not match."));
        setPasswordSaving(false);
        return;
      }

      try {
        await updatePassword(passwordFields.password);
        setPasswordMessage(t("account.web.passwordUpdated", "Password updated."));
        setPasswordFields({ password: "", confirm: "" });
      } catch (err: any) {
        console.error("[web-account] password update failed", err);
        const message =
          typeof err?.message === "string" && err.message
            ? err.message
            : t("account.web.passwordUpdateError", "Unable to update your password. Please try again.");
        setPasswordError(message);
      } finally {
        setPasswordSaving(false);
      }
    },
    [passwordFields, t, updatePassword]
  );

  const handleSignOutOthers = useCallback(async () => {
    setSaving(true);
    setError(null);
    setActionMessage(null);
    try {
      await revokeOtherWebSessions();
      setActionMessage(t("account.web.sessionsRevoked", "Signed out other sessions."));
    } catch (err: any) {
      console.error("[web-account] revoke sessions failed", err);
      setError(typeof err?.message === "string" ? err.message : "Unable to sign out other sessions.");
    } finally {
      setSaving(false);
    }
  }, [t]);

  const handleLogout = useCallback(async () => {
    try {
      await performWebLogout();
    } catch {}
    window.location.href = "/";
  }, []);

  const handleRequestConfirm = useCallback(() => {
    navigate("/login?mode=register");
  }, [navigate]);

  const planOptions = useMemo(
    () =>
      ["standard", "plus"].map((key) => ({
        key,
        title: PLAN_COPY[key].title,
        bullets: PLAN_COPY[key].bullets,
      })),
    []
  );

  const sessionExpiryLabel = useMemo(() => {
    const raw = sessionExpiresAt ?? authExpires ?? null;
    if (!raw) return "2 hours from now";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "2 hours from now";
    return parsed.toLocaleString();
  }, [sessionExpiresAt, authExpires]);

  const verifiedBadge = useMemo(
    () => ({
      verified: verification.verified,
      headline: verification.verified
        ? t("account.web.confirmedBadge", "Email confirmed")
        : t("account.web.pendingBadge", "Confirmation pending"),
      detail: verification.verified
        ? t("account.web.confirmedDetail", "Locked via {{method}} — future sign-ins can use passwords or magic links.", {
            method:
              verification.method === "code"
                ? t("account.web.methodCode", "6-digit code")
                : t("account.web.methodLink", "one-click link"),
          })
        : t(
            "account.web.unverifiedDetail",
            "Finish the one-time check using either the one-click link or the 6-digit code we emailed."
          ),
    }),
    [verification, t]
  );

  const combinedError = error ?? bridgeError;

  return (
    <div className="landing home-v2 web-account-page">
      <ImpersonationBanner />
      <TopBar />

      <WebAccountContent
        t={t}
        profile={bridgeProfile}
        planOptions={planOptions}
        currentPlanKey={currentPlanKey}
        verifiedBadge={verifiedBadge}
        onRequestConfirm={handleRequestConfirm}
        error={combinedError}
        actionMessage={actionMessage}
        refreshProfile={refresh}
        loading={loading}
        formFields={formFields}
        handleFieldChange={handleFieldChange}
        handleSave={handleSave}
        saving={saving}
        passwordFields={passwordFields}
        handlePasswordFieldChange={handlePasswordFieldChange}
        handlePasswordSave={handlePasswordSave}
        passwordSaving={passwordSaving}
        passwordError={passwordError}
        passwordMessage={passwordMessage}
        trialSummary={trialSummary as TrialSummary}
        upgradeUrl={PAYPAL_PLUS_URL}
        sessionExpiryLabel={sessionExpiryLabel}
        handleSignOutOthers={handleSignOutOthers}
        handleLogout={handleLogout}
        isAdmin={isAdmin}
        isOwner={isOwner}
      />

      <Footer />
    </div>
  );
}
