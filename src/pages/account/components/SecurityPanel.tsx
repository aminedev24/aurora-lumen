import React from "react";
import { Link } from "react-router-dom";
import type { TFunction } from "i18next";

type SecurityPanelProps = {
  t: TFunction<"app">;
  sessionMessage: string | null;
  sessionError: string | null;
  onRevokeOthers: () => void;
  revokingSessions: boolean;
  onDownloadHistory: () => void;
  downloading: boolean;
};

export function SecurityPanel({
  t,
  sessionMessage,
  sessionError,
  onRevokeOthers,
  revokingSessions,
  onDownloadHistory,
  downloading,
}: SecurityPanelProps) {
  return (
    <article className="account-panel account-panel--security" style={{ gridColumn: "1 / -1" }}>
      <div className="account-panel-header" style={{ alignItems: "flex-start" }}>
        <div>
          <h3 className="account-panel-title">
            {t("accountPage.security.title", "Security & data")}
          </h3>
          <p className="account-panel-subtext">
            {t(
              "accountPage.security.copy",
              "Protect your login and pull records without leaving the desktop app."
            )}
          </p>
        </div>
      </div>
      <div className="account-panel-body security-panel-body">
        <div className="security-card">
          <h4>{t("accountPage.security.passwordTitle", "Change password")}</h4>
          <p>
            {t(
              "accountPage.security.passwordCopy",
              "Use a fresh password anytime. We’ll email confirmations immediately."
            )}
          </p>
          <Link to="/reset-password" className="btn btn--primary">
            {t("accountPage.security.resetCta", "Change password")}
          </Link>
        </div>

        <div className="security-card">
          <h4>{t("accountPage.security.sessionsTitle", "Device sessions")}</h4>
          {sessionError && (
            <div className="admin-alert error" role="alert">
              {sessionError}
            </div>
          )}
          {sessionMessage && (
            <div className="admin-alert success" role="status">
              {sessionMessage}
            </div>
          )}
          <p>
            {t(
              "accountPage.security.sessionsCopy",
              "Sign out everywhere else if you lost a device or shared a login."
            )}
          </p>
          <button
            type="button"
            className="btn btn--outline"
            onClick={onRevokeOthers}
            disabled={revokingSessions}
          >
            {revokingSessions
              ? t("accountPage.security.revoking", "Revoking…")
              : t("accountPage.security.signOutOthers", "Sign out other devices")}
          </button>
        </div>

        <div className="security-card">
          <h4>{t("accountPage.security.exportTitle", "Chat history export")}</h4>
          <p>
            {t(
              "accountPage.security.exportCopy",
              "Download a JSON archive of everything you discussed with Aurora."
            )}
          </p>
          <button
            type="button"
            onClick={onDownloadHistory}
            className="btn btn--ghost"
            disabled={downloading}
          >
            {downloading
              ? t("accountPage.security.exporting", "Preparing…")
              : t("accountPage.security.export", "Download chat history (JSON)")}
          </button>
        </div>
      </div>
    </article>
  );
}
