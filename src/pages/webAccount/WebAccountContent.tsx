import React, { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import type { TFunction } from "i18next";
import { RefreshCcw, ShieldCheck, LogOut, Clock } from "lucide-react";
import type { BridgeProfile } from "@/shared/accountBridge/useAccountBridge";
import type { EditableFields, TrialSummary } from "./types";
import { AdminControls } from "./AdminControls";

type PlanOption = { key: string; title: string; bullets: string[] };

type WebAccountContentProps = {
  t: TFunction<"translation", undefined>;
  profile: BridgeProfile | null;
  planOptions: PlanOption[];
  currentPlanKey: string;
  verifiedBadge: { verified: boolean; headline: string; detail: string };
  onRequestConfirm: () => void;
  error: string | null;
  actionMessage: string | null;
  refreshProfile: () => void;
  loading: boolean;
  formFields: EditableFields;
  handleFieldChange: (
    field: keyof EditableFields
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: (event: React.FormEvent) => void;
  saving: boolean;
  passwordFields: { password: string; confirm: string };
  handlePasswordFieldChange: (
    field: "password" | "confirm"
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordSave: (event: React.FormEvent) => void;
  passwordSaving: boolean;
  passwordError: string | null;
  passwordMessage: string | null;
  trialSummary: TrialSummary;
  upgradeUrl: string;
  sessionExpiryLabel: string;
  handleSignOutOthers: () => void;
  handleLogout: () => void;
  isAdmin: boolean;
  isOwner: boolean;
};

const BASE_NAV_LINKS = [
  { id: "profile", label: "Profile" },
  { id: "subscription", label: "Subscription" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data control" },
  { id: "app-settings", label: "App settings" },
];

export function WebAccountContent({
  t,
  profile,
  planOptions,
  currentPlanKey,
  verifiedBadge,
  onRequestConfirm,
  error,
  actionMessage,
  refreshProfile,
  loading,
  formFields,
  handleFieldChange,
  handleSave,
  saving,
  passwordFields,
  handlePasswordFieldChange,
  handlePasswordSave,
  passwordSaving,
  passwordError,
  passwordMessage,
  trialSummary,
  upgradeUrl,
  sessionExpiryLabel,
  handleSignOutOthers,
  handleLogout,
  isAdmin,
  isOwner,
}: WebAccountContentProps) {
  const navLinks = useMemo(() => {
    const links = [...BASE_NAV_LINKS];
    if (isAdmin) {
      links.push({ id: "admin", label: "Admin" });
    }
    return links;
  }, [isAdmin]);
  const [activeSection, setActiveSection] = useState<string>(BASE_NAV_LINKS[0].id);

  useEffect(() => {
    if (!navLinks.find((link) => link.id === activeSection) && navLinks.length) {
      setActiveSection(navLinks[0].id);
    }
  }, [navLinks, activeSection]);

  const renderProfile = () => (
    <section id="profile" className="web-account-section">
      <header>
        <h2>{t("account.web.profileTitle", "Profile")}</h2>
        <p>
          {t(
            "account.web.profileCopy",
            "Keep your key identity fields current so Aurora reflects you across the web account and desktop app."
          )}
        </p>
      </header>

      <div className="section-card">
        <div className={`web-account-verified-badge ${verifiedBadge.verified ? "is-verified" : "is-unverified"}`}>
          <ShieldCheck size={16} aria-hidden="true" />
          <div>
            <strong>{verifiedBadge.headline}</strong>
            <span>{verifiedBadge.detail}</span>
            {!verifiedBadge.verified && (
              <button type="button" className="web-account-verified-request" onClick={onRequestConfirm}>
                {t("account.web.requestConfirm", "Request confirmation link")}
              </button>
            )}
          </div>
        </div>

        <form className="web-account-form" onSubmit={handleSave}>
          <div className="form-header">
            <h3>{t("account.web.profileHeading", "Profile")}</h3>
            <button type="button" className="web-account-refresh" onClick={refreshProfile} disabled={loading}>
              <RefreshCcw size={16} aria-hidden="true" />
              {loading ? t("account.web.refreshing", "Refreshing…") : t("account.web.refresh", "Refresh")}
            </button>
          </div>

          <label htmlFor="web-account-name">{t("account.web.nameLabel", "Name")}</label>
          <input
            id="web-account-name"
            type="text"
            value={formFields.name ?? ""}
            onChange={handleFieldChange("name")}
            placeholder={t("account.web.namePlaceholder", "Used in greetings and receipts")}
          />

          <label htmlFor="web-account-first-name">{t("account.web.firstNameLabel", "First name")}</label>
          <input
            id="web-account-first-name"
            type="text"
            value={formFields.firstName ?? ""}
            readOnly
            aria-readonly="true"
            className="web-account-input--readonly"
          />
          <p className="web-account-note">
            {t("account.web.firstNameNote", "Managed inside the Aurora App so we can match your persona settings.")}
          </p>

          <label htmlFor="web-account-email">{t("account.web.emailLabel", "Email")}</label>
          <input
            id="web-account-email"
            type="email"
            value={formFields.email ?? ""}
            readOnly
            aria-readonly="true"
            className="web-account-input--readonly"
          />
          <p className="web-account-note">
            {t("account.web.emailNote", "Need to change this? Contact support so we can keep security logs intact.")}
          </p>

          <label htmlFor="web-account-phone">{t("account.web.phoneLabel", "Phone (optional)")}</label>
          <input
            id="web-account-phone"
            type="tel"
            value={formFields.phone ?? ""}
            onChange={handleFieldChange("phone")}
            placeholder={t("account.web.phonePlaceholder", "For account notifications")}
          />

          <button type="submit" className="web-account-primary" disabled={saving}>
            {saving ? t("account.web.saving", "Saving…") : t("account.web.saveChanges", "Save changes")}
          </button>
        </form>
      </div>
    </section>
  );

  const renderSubscription = () => (
    <section id="subscription" className="web-account-section">
      <header>
        <h2>{t("account.web.subscriptionTitle", "Subscription")}</h2>
        <p>{t("account.web.subscriptionCopy", "Choose the plan that matches your daily workload.")}</p>
      </header>
      <div className="subscription-grid">
        {planOptions.map((plan) => {
          const isActive = plan.key === currentPlanKey;
          return (
            <div key={plan.key} className={`subscription-card ${isActive ? "is-active" : ""}`} aria-current={isActive}>
              <div className="subscription-card-head">
                <div className="eyebrow">{plan.key === "plus" ? "Aurora Plus" : "Standard"}</div>
                <h3>{plan.title}</h3>
                {isActive && <span className="subscription-pill">{t("account.web.currentPlan", "Current plan")}</span>}
              </div>
              <ul>
                {plan.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {!isActive && plan.key === "plus" && (
                <a className="web-account-plus-button" href={upgradeUrl} target="_blank" rel="noopener noreferrer">
                  {t("account.web.getPlus", "Upgrade to Aurora Plus")}
                </a>
              )}
              {!isActive && plan.key === "standard" && (
                <p className="subscription-footnote">
                  {trialSummary.status === "active"
                    ? t("account.web.plusTrialActiveCta", "Enjoying Plus? Upgrade permanently in seconds.")
                    : t("account.web.standardNote", "Standard includes a complimentary Aurora Plus test drive.")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section id="security" className="web-account-section">
      <header>
        <h2>{t("account.web.securityTitle", "Security")}</h2>
        <p>{t("account.web.securityCopy", "Strengthen sign-in, manage devices, and keep sessions tidy.")}</p>
      </header>

      <div className="security-grid">
        <div className="section-card">
          <div className="form-header">
            <h3>{t("account.web.mfaHeading", "Multi-factor authentication")}</h3>
          </div>
          <p>
            {t(
              "account.web.mfaCopy",
              "Email + passkeys support launches soon. You’ll be able to require an OTP for every new device."
            )}
          </p>
          <button type="button" className="web-account-secondary" disabled>
            {t("account.web.comingSoon", "Coming soon")}
          </button>
        </div>

        <div className="section-card">
          <div className="form-header">
            <h3>{t("account.web.signInOptions", "Sign-in options")}</h3>
          </div>

          {passwordError && <div className="web-account-alert error">{passwordError}</div>}
          {passwordMessage && <div className="web-account-alert success">{passwordMessage}</div>}

          <form className="web-account-form" onSubmit={handlePasswordSave}>
            <label htmlFor="web-account-password">{t("account.web.newPassword", "New password")}</label>
            <input
              id="web-account-password"
              type="password"
              value={passwordFields.password}
              onChange={handlePasswordFieldChange("password")}
              autoComplete="new-password"
              placeholder="••••••••"
            />

            <label htmlFor="web-account-password-confirm">{t("account.web.confirmPassword", "Confirm password")}</label>
            <input
              id="web-account-password-confirm"
              type="password"
              value={passwordFields.confirm}
              onChange={handlePasswordFieldChange("confirm")}
              autoComplete="new-password"
              placeholder="••••••••"
            />

            <button type="submit" className="web-account-primary" disabled={passwordSaving}>
              {passwordSaving ? t("account.web.saving", "Saving…") : t("account.web.savePassword", "Save password")}
            </button>
          </form>

          <p className="web-account-note">
            {t(
              "account.web.passwordNote",
              "Once saved you can sign in with email + password or keep using the magic link tab for one-off codes."
            )}
          </p>
        </div>

        <div className="section-card">
          <div className="form-header">
            <h3>{t("account.web.sessionHeading", "Devices & sessions")}</h3>
            <Clock size={18} aria-hidden="true" />
          </div>
          <dl className="session-details">
            <div>
              <dt>{t("account.web.email", "Email")}</dt>
              <dd>{profile?.email ?? "—"}</dd>
            </div>
            <div>
              <dt>{t("account.web.plan", "Plan")}</dt>
              <dd>{planOptions.find((p) => p.key === currentPlanKey)?.title ?? "Standard"}</dd>
            </div>
            <div>
              <dt>{t("account.web.phoneShort", "Phone")}</dt>
              <dd>{profile?.phone || t("account.web.phoneMissing", "Not added yet")}</dd>
            </div>
            <div>
              <dt>{t("account.web.sessionExpires", "Session expires")}</dt>
              <dd>{sessionExpiryLabel}</dd>
            </div>
          </dl>
          <div className="session-actions">
            <button type="button" className="web-account-secondary" onClick={handleSignOutOthers}>
              {t("account.web.revokeOthers", "Sign out other devices")}
            </button>
            <button type="button" className="web-account-danger" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              {t("account.web.signOut", "Sign out")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderData = () => (
    <section id="data" className="web-account-section">
      <header>
        <h2>{t("account.web.dataTitle", "Data control")}</h2>
        <p>
          {t(
            "account.web.dataCopy",
            "Exports will soon email your full chat history straight to your inbox. We’re polishing the workflow now."
          )}
        </p>
      </header>
      <div className="section-card data-card">
        <p>
          {t("account.web.dataNote", "Exports will send your entire chat history to {{email}} as soon as the email workflow ships.", {
            email: profile?.email || t("account.web.yourEmail", "your primary email"),
          })}
        </p>
        <button type="button" className="web-account-secondary" disabled>
          {t("account.web.exportSoon", "Export data (coming soon)")}
        </button>
      </div>
    </section>
  );

  const renderAppSettings = () => (
    <section id="app-settings" className="web-account-section">
      <header>
        <h2>{t("account.web.appSettingsTitle", "App settings")}</h2>
        <p>{t("account.web.appSettingsCopy", "Personalize Aurora’s skin, theme, and shortcuts inside the desktop app.")}</p>
      </header>
      <div className="section-card app-settings-card">
        <p>
          {t(
            "account.web.appSettingsDetail",
            "Open Aurora, head to Settings → App Settings, and choose from the metallic skins, font scales, and layout presets. Everything syncs automatically."
          )}
        </p>
      </div>
    </section>
  );

  const sectionMap: Record<string, JSX.Element> = {
    profile: renderProfile(),
    subscription: renderSubscription(),
    security: renderSecurity(),
    data: renderData(),
    "app-settings": renderAppSettings(),
  };
  if (isAdmin) {
    sectionMap.admin = (
      <section id="admin" className="web-account-section">
        <AdminControls t={t} isAdmin={isAdmin} isOwner={isOwner} />
      </section>
    );
  }

  return (
    <main className="web-account-body">
      <section className="web-account-hero">
        <div className="web-account-greeting">
          <p className="eyebrow">{t("account.web.heroEyebrow", "Aurora Account")}</p>
          <h1>
            {(() => {
              const greetingName =
                (profile?.firstName && profile.firstName.trim()) ||
                (profile?.name || "").split(" ")[0] ||
                "";
              return greetingName
                ? t("account.web.greetingNamed", "Hi {{name}}", { name: greetingName })
                : t("account.web.greetingFallback", "Hi there");
            })()}
          </h1>
          <p>
            {t(
              "account.web.subtitle",
              "Stay in control of your identity, subscription, security, and exports from one focused dashboard."
            )}
          </p>
        </div>
      </section>

      {error && <div className="web-account-alert error">{error}</div>}
      {actionMessage && <div className="web-account-alert success">{actionMessage}</div>}

      <div className="web-account-layout">
        <aside className="web-account-nav">
          <p className="nav-title">{t("account.web.contents", "Contents")}</p>
          <ul>
            {navLinks.map((link) => (
              <li key={link.id}>
                <button type="button" className={activeSection === link.id ? "active" : ""} onClick={() => setActiveSection(link.id)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="web-account-main">{sectionMap[activeSection]}</div>
      </div>
    </main>
  );
}
