// ==============================================================================
// File: /frontend/src/pages/account/AccountPage.tsx
// Description: Aurora Lumen — App Account Page (identity + plan + security)
// ==============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import { useAuthStore } from "@/stores/authStore";
import { apiUrl, revokeOtherSessions } from "@/lib/api";
import { useAccountBridge } from "@/shared/accountBridge/useAccountBridge";
import type { IdentityFields, PlanDescriptor, PlanKey } from "./types";
import { IdentityPanel } from "./components/IdentityPanel";
import { PlanPanel } from "./components/PlanPanel";
import { SecurityPanel } from "./components/SecurityPanel";
import { AppCalloutPanel } from "./components/AppCalloutPanel";
import { GuestCard } from "./components/GuestCard";
import "./AdminDashboard.css";

export default function AccountPage() {
  const { t } = useTranslation("app");
  const { user, isLoggedIn, _hydrate } = useAuthStore();
  const {
    profile: bridgeProfile,
    loading: bridgeLoading,
    error: bridgeError,
    planKey: bridgePlanKey,
    refresh: refreshBridge,
    updateProfile: persistBridgeProfile,
    trialSummary,
  } = useAccountBridge();

  useEffect(() => {
    try {
      _hydrate();
    } catch {}
  }, [_hydrate]);

  const displayName =
    (user?.firstName && user.firstName.trim()) ||
    (user?.username && user.username.trim()) ||
    "Aurora member";
  const hasDonorBadge = Boolean(user?.badges?.includes("aurora_donor"));
  const decoratedName = hasDonorBadge ? `${displayName} ★` : displayName;
  const isOwner = Boolean(
    user?.isOwner ||
      user?.role === "owner" ||
      (Array.isArray((user as any)?.roles) && (user as any).roles.includes("owner"))
  );

  const [identityFields, setIdentityFields] = useState<IdentityFields>({
    name: "",
    firstName: "",
    email: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  useEffect(() => {
    const fallbackName = bridgeProfile?.name ?? user?.username ?? "";
    const fallbackFirst =
      bridgeProfile?.firstName ?? user?.firstName ?? fallbackName.split(" ")[0] ?? "";
    const fallbackEmail = bridgeProfile?.email ?? user?.email ?? "";
    const fallbackPhone = bridgeProfile?.phone ?? user?.phone ?? "";

    setIdentityFields((prev) => {
      if (
        prev.name === fallbackName &&
        prev.firstName === fallbackFirst &&
        prev.email === fallbackEmail &&
        prev.phone === fallbackPhone
      ) {
        return prev;
      }
      return {
        name: fallbackName,
        firstName: fallbackFirst,
        email: fallbackEmail,
        phone: fallbackPhone,
      };
    });
  }, [
    bridgeProfile?.name,
    bridgeProfile?.firstName,
    bridgeProfile?.email,
    bridgeProfile?.phone,
    user?.username,
    user?.firstName,
    user?.email,
    user?.phone,
  ]);

  const handleIdentityChange =
    (field: keyof IdentityFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setIdentityFields((prev) => ({ ...prev, [field]: value }));
      setProfileNotice(null);
      setProfileError(null);
    };

  const handleIdentityRefresh = async () => {
    try {
      setRefreshingProfile(true);
      setProfileNotice(null);
      setProfileError(null);
      await refreshBridge();
      setProfileNotice(t("accountPage.identityRefreshed", "Profile synced with Aurora."));
    } catch (err: any) {
      const detail =
        typeof err?.message === "string"
          ? err.message
          : t("accountPage.identityRefreshError", "Unable to refresh profile.");
      setProfileError(detail);
    } finally {
      setRefreshingProfile(false);
    }
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (profileSaving) return;
    setProfileNotice(null);
    setProfileError(null);
    try {
      setProfileSaving(true);

      // ✅ FIXED: null → undefined to satisfy TS type ({ name?: string | undefined })
      await persistBridgeProfile({
        name: identityFields.name.trim() || undefined,
        phone: identityFields.phone.trim() || undefined,
      });

      setProfileNotice(t("accountPage.identitySaved", "Profile updated."));
    } catch (err: any) {
      const detail =
        typeof err?.message === "string"
          ? err.message
          : t("accountPage.identityError", "Unable to save your profile.");
      setProfileError(detail);
    } finally {
      setProfileSaving(false);
    }
  };

  const planOptions = useMemo<PlanDescriptor[]>(
    () => [
      {
        key: "free",
        title: t("accountPage.plan.freeTitle", "Free plan"),
        description: t(
          "accountPage.plan.freeDesc",
          "Core Aurora chat access with baseline memory."
        ),
        bullets: [
          t("accountPage.plan.free1", "Daily Aurora chats with safeguards"),
          t("accountPage.plan.free2", "Community support + monthly upgrades"),
        ],
      },
      {
        key: "standard",
        title: t("accountPage.plan.standardTitle", "Standard plan"),
        description: t(
          "accountPage.plan.standardDesc",
          "Includes the complimentary 7-day Aurora Plus trial."
        ),
        bullets: [
          t("accountPage.plan.standard1", "Priority responses + workspace basics"),
          t(
            "accountPage.plan.standard2",
            "Aurora Plus features unlock automatically during the trial."
          ),
        ],
      },
      {
        key: "plus",
        title: t("accountPage.plan.plusTitle", "Aurora Plus"),
        description: t(
          "accountPage.plan.plusDesc",
          "Unlimited tokens, creative boosts, and full workspace power."
        ),
        bullets: [
          t("accountPage.plan.plus1", "Unlimited automations and persona sharing"),
          t("accountPage.plan.plus2", "Fast-lane support and advanced APIs"),
        ],
      },
    ],
    [t]
  );

  const effectivePlanKey = useMemo<PlanKey>(() => {
    const normalizedBridge = (bridgePlanKey || "").toLowerCase();
    const normalizedAppPlan = (user?.accountType || "").toLowerCase();
    if (isOwner || normalizedBridge === "plus" || normalizedAppPlan.includes("plus")) {
      return "plus";
    }
    if (
      normalizedBridge === "standard" ||
      normalizedAppPlan.includes("standard") ||
      normalizedAppPlan === "aurora plus"
    ) {
      return "standard";
    }
    return "free";
  }, [bridgePlanKey, user?.accountType, isOwner]);

  const activePlan =
    planOptions.find((plan) => plan.key === effectivePlanKey) ?? planOptions[0];

  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokingSessions, setRevokingSessions] = useState(false);

  const handleSignOutOthers = useCallback(async () => {
    try {
      setSessionMessage(null);
      setSessionError(null);
      setRevokingSessions(true);
      const response = await revokeOtherSessions();
      const revokedTotal =
        typeof response?.revoked === "number" ? response.revoked : null;
      if (revokedTotal && revokedTotal > 0) {
        setSessionMessage(
          t("accountPage.security.revokedCount", "{{count}} sessions revoked.", {
            count: revokedTotal,
          })
        );
      } else {
        setSessionMessage(
          t("accountPage.security.revoked", "All other sessions were signed out.")
        );
      }
    } catch (err: any) {
      const detail =
        typeof err?.message === "string"
          ? err.message
          : t("accountPage.security.error", "Unable to revoke the other sessions.");
      setSessionError(detail);
    } finally {
      setRevokingSessions(false);
    }
  }, [t]);

  const [downloading, setDownloading] = useState(false);
  const downloadHistory = useCallback(async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("aurora_token") || "";
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const listRes = await fetch(apiUrl("/api/history/list?mode=aurora"), {
        headers,
        credentials: "omit",
      });
      if (!listRes.ok) throw new Error(`Failed to list: ${listRes.status}`);
      const chats: Array<{ title: string } & any> = await listRes.json();

      const exportPayload: any = {
        mode: "aurora",
        exportedAt: new Date().toISOString(),
        chats: [] as any[],
      };

      for (const item of chats) {
        const title = encodeURIComponent(item.title);
        let before: number | null = null;
        const allMessages: any[] = [];
        for (;;) {
          const url = apiUrl(
            `/api/history/page?mode=aurora&chat_title=${title}&limit=500${
              before ? `&before=${before}` : ""
            }`
          );
          const pageRes = await fetch(url, { headers, credentials: "omit" });
          if (!pageRes.ok) break;
          const page = await pageRes.json();
          const msgs = page?.messages || [];
          allMessages.push(...msgs);
          const next = page?.next_cursor;
          if (!next) break;
          before = next;
        }
        exportPayload.chats.push({ title: item.title, messages: allMessages });
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aurora_history_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to download history. Please ensure you are signed in.");
    } finally {
      setDownloading(false);
    }
  }, []);

  const appCalloutBullets = useMemo(
    () => [
      t("accountPage.focus.app.point1", "AI persona builder and tone presets"),
      t("accountPage.focus.app.point2", "Theme and skin picker (Aurora, Tiger, Zebra, Cheetah)"),
      t(
        "accountPage.focus.app.point3",
        "Workspace automations, shared notes, and advanced tools"
      ),
    ],
    [t]
  );

  const heroCopy = t("accountPage.hero.copy", {
    defaultValue: `Hi ${decoratedName}, keep your key identity, subscription, and security controls in sync with the Aurora app.`,
    name: decoratedName,
  });

  return (
    <div className="landing account-page">
      <TopBar />

      <section className="account-hero">
        <h1>{t("settings.title", "Account Settings")}</h1>
        <p>{heroCopy}</p>
      </section>

      <div className="account-container">
        {!isLoggedIn ? (
          <GuestCard t={t} />
        ) : (
          <div className="account-panels">
            <div className="account-panels-grid">
              <IdentityPanel
                t={t}
                fields={identityFields}
                loading={bridgeLoading}
                saving={profileSaving}
                refreshing={refreshingProfile}
                notice={profileNotice}
                error={profileError}
                bridgeError={bridgeError}
                onChange={handleIdentityChange}
                onSave={handleProfileSave}
                onRefresh={handleIdentityRefresh}
              />
              <PlanPanel
                t={t}
                plan={activePlan}
                trialSummary={trialSummary}
                showUpgradeCta={effectivePlanKey !== "plus"}
                upgradeHref="/contact?topic=account"
              />
              <SecurityPanel
                t={t}
                sessionMessage={sessionMessage}
                sessionError={sessionError}
                onRevokeOthers={handleSignOutOthers}
                revokingSessions={revokingSessions}
                onDownloadHistory={downloadHistory}
                downloading={downloading}
              />
            </div>

            <AppCalloutPanel t={t} bullets={appCalloutBullets} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
