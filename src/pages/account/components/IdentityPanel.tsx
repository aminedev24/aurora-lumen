import React from "react";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import type { IdentityFields } from "../types";

type IdentityPanelProps = {
  t: TFunction<"app">;
  fields: IdentityFields;
  loading: boolean;
  saving: boolean;
  refreshing: boolean;
  notice: string | null;
  error: string | null;
  bridgeError: string | null;
  onChange: (field: keyof IdentityFields) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
};

export function IdentityPanel({
  t,
  fields,
  loading,
  saving,
  refreshing,
  notice,
  error,
  bridgeError,
  onChange,
  onSave,
  onRefresh,
}: IdentityPanelProps) {
  const disabled = saving || loading;

  return (
    <article className="account-panel account-panel--identity">
      <div className="account-panel-header" style={{ alignItems: "flex-start" }}>
        <div>
          <h3 className="account-panel-title">
            {t("accountPage.identity.title", "Identity & profile")}
          </h3>
          <p className="account-panel-subtext">
            {t(
              "accountPage.identity.copy",
              "Update how Aurora greets you in receipts and the workspace."
            )}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onRefresh}
          disabled={refreshing || loading}
        >
          {refreshing
            ? t("accountPage.identity.refreshing", "Refreshing…")
            : t("accountPage.identity.refresh", "Refresh")}
        </button>
      </div>

      {bridgeError && (
        <div className="admin-alert error" role="alert">
          {bridgeError}
        </div>
      )}
      {error && (
        <div className="admin-alert error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="admin-alert success" role="status">
          {notice}
        </div>
      )}

      <form className="account-form" onSubmit={onSave}>
        <label className="account-label" htmlFor="account-name">
          {t("accountPage.identity.name", "Name")}
        </label>
        <input
          id="account-name"
          type="text"
          className="account-input"
          value={fields.name}
          onChange={onChange("name")}
          placeholder={t(
            "accountPage.identity.namePlaceholder",
            "Used in greetings and invoices"
          )}
          disabled={disabled}
        />

        <label className="account-label" htmlFor="account-first-name">
          {t("accountPage.identity.firstName", "First name")}
        </label>
        <input
          id="account-first-name"
          type="text"
          className="account-input"
          value={fields.firstName}
          readOnly
          aria-readonly="true"
        />
        <p className="form-note">
          {t(
            "accountPage.identity.firstNameNote",
            "Managed by the Aurora App persona flow to keep tone + pronunciation aligned."
          )}
        </p>

        <label className="account-label" htmlFor="account-email">
          {t("accountPage.identity.email", "Email")}
        </label>
        <input
          id="account-email"
          type="email"
          className="account-input"
          value={fields.email}
          readOnly
          aria-readonly="true"
        />
        <p className="form-note">
          {t(
            "accountPage.identity.emailNote",
            "Need to change the email? Contact an owner or Aurora support so we can keep the security log intact."
          )}{" "}
          <Link to="/contact?topic=account" className="btn btn--link">
            {t("accountPage.identity.contactSupport", "Contact support")}
          </Link>
        </p>

        <label className="account-label" htmlFor="account-phone">
          {t("accountPage.identity.phone", "Phone (optional)")}
        </label>
        <input
          id="account-phone"
          type="tel"
          className="account-input"
          value={fields.phone}
          onChange={onChange("phone")}
          placeholder={t(
            "accountPage.identity.phonePlaceholder",
            "For account notifications"
          )}
          disabled={disabled}
        />

        <div className="account-actions">
          <button type="submit" className="btn btn--primary" disabled={saving || loading}>
            {saving
              ? t("accountPage.identity.saving", "Saving…")
              : t("accountPage.identity.save", "Save changes")}
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={onRefresh}
            disabled={refreshing || loading}
          >
            {t("accountPage.identity.reSync", "Sync from server")}
          </button>
        </div>
      </form>
    </article>
  );
}
