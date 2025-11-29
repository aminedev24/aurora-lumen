import React from "react";
import type { TFunction } from "i18next";
import type { AdminAppUser, AdminWebAccountUser } from "@/lib/webAuth";

export type AdminStatusSummary = {
  status?: string | null;
  lockedAt?: string | null;
  lockedReason?: string | null;
  bannedAt?: string | null;
  bannedReason?: string | null;
  deletedAt?: string | null;
};

type OverviewProps = {
  t: TFunction<"translation", undefined>;
  adminTarget: AdminWebAccountUser | null;
  adminAppUser: AdminAppUser | null;
  planLabel: string;
  effectivePlan: string;
  planStatus: string;
  roles: string[];
  verifiedLabel: string;
  statusDetails: AdminStatusSummary | null;
};

export function AdminOverviewPane({
  t,
  adminTarget,
  adminAppUser,
  planLabel,
  effectivePlan,
  planStatus,
  roles,
  verifiedLabel,
  statusDetails,
}: OverviewProps) {
  if (!adminTarget) {
    return (
      <div className="admin-card admin-placeholder">
        {t("account.web.adminLoadPrompt", "Load a user to inspect their status and history.")}
      </div>
    );
  }

  return (
    <div className="admin-card admin-summary-card">
      <dl className="admin-target-grid">
        <div>
          <dt>{t("account.web.email", "Email")}</dt>
          <dd>{adminTarget.email}</dd>
        </div>
        {adminAppUser?.username && (
          <div>
            <dt>{t("account.web.username", "Username")}</dt>
            <dd>{adminAppUser.username}</dd>
          </div>
        )}
        <div>
          <dt>{t("account.web.planStored", "Stored plan")}</dt>
          <dd>{planLabel}</dd>
        </div>
        <div>
          <dt>{t("account.web.planEffective", "Effective plan")}</dt>
          <dd>{effectivePlan}</dd>
        </div>
        <div>
          <dt>{t("account.web.planStatus", "Plan status")}</dt>
          <dd>{planStatus}</dd>
        </div>
        <div>
          <dt>{t("account.web.roles", "Roles")}</dt>
          <dd>{roles.length ? roles.join(", ") : t("account.web.none", "None")}</dd>
        </div>
        <div>
          <dt>{t("account.web.verification", "Verification")}</dt>
          <dd>{verifiedLabel}</dd>
        </div>
        {statusDetails?.status && (
          <div>
            <dt>{t("account.web.accountStatus", "Account status")}</dt>
            <dd>{statusDetails.status}</dd>
          </div>
        )}
        {statusDetails?.lockedAt && (
          <div>
            <dt>{t("account.web.lockedAt", "Locked at")}</dt>
            <dd>
              {new Date(statusDetails.lockedAt).toLocaleString()}{" "}
              {statusDetails.lockedReason ? `— ${statusDetails.lockedReason}` : ""}
            </dd>
          </div>
        )}
        {statusDetails?.bannedAt && (
          <div>
            <dt>{t("account.web.bannedAt", "Banned at")}</dt>
            <dd>
              {new Date(statusDetails.bannedAt).toLocaleString()}{" "}
              {statusDetails.bannedReason ? `— ${statusDetails.bannedReason}` : ""}
            </dd>
          </div>
        )}
        {statusDetails?.deletedAt && (
          <div>
            <dt>{t("account.web.deletedAt", "Deleted at")}</dt>
            <dd>{new Date(statusDetails.deletedAt).toLocaleString()}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

type PlanPaneProps = {
  t: TFunction<"translation", undefined>;
  adminBusy: boolean;
  adminReason: string;
  adminNote: string;
  isOwner: boolean;
  hasAdminRole: boolean;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onGrantPlus: () => void;
  onRevokePlus: () => void;
  onPromote: () => void;
  onDemote: () => void;
};

export function AdminPlanPane({
  t,
  adminBusy,
  adminReason,
  adminNote,
  isOwner,
  hasAdminRole,
  onReasonChange,
  onNoteChange,
  onGrantPlus,
  onRevokePlus,
  onPromote,
  onDemote,
}: PlanPaneProps) {
  return (
    <div className="admin-pane-grid">
      <div className="admin-card compact">
        <h3>{t("account.web.adminPlusHeading", "Aurora Plus access")}</h3>
        <p>{t("account.web.adminPlusCopy", "Grant or revoke Plus while leaving an internal note for other admins.")}</p>
        <label>
          {t("account.web.adminReason", "Reason / context")}
          <textarea
            value={adminReason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={t("account.web.adminReasonPlaceholder", "Why are you changing this plan?")}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.adminNote", "Support note (optional)")}
          <textarea
            value={adminNote}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={t("account.web.adminNotePlaceholder", "Internal note for other admins.")}
            disabled={adminBusy}
          />
        </label>
        <div className="admin-actions compact">
          <button type="button" className="web-account-primary" onClick={onGrantPlus} disabled={adminBusy}>
            {t("account.web.adminGrantPlus", "Grant Aurora Plus")}
          </button>
          <button type="button" className="web-account-secondary" onClick={onRevokePlus} disabled={adminBusy}>
            {t("account.web.adminRevokePlus", "Revoke Access")}
          </button>
        </div>
      </div>

      <div className="admin-card compact">
        <h3>{t("account.web.adminRolesHeading", "Admin roles")}</h3>
        <p>{t("account.web.adminRolesCopy", "Only owners can promote or demote admins.")}</p>
        <div className="admin-actions compact">
          <button
            type="button"
            className="web-account-secondary"
            onClick={onPromote}
            disabled={adminBusy || !isOwner || hasAdminRole}
          >
            {t("account.web.adminGrantRole", "Grant Admin")}
          </button>
          <button
            type="button"
            className="web-account-danger"
            onClick={onDemote}
            disabled={adminBusy || !isOwner || !hasAdminRole}
          >
            {t("account.web.adminRemoveRole", "Remove Admin")}
          </button>
        </div>
      </div>
    </div>
  );
}

type AccessPaneProps = {
  t: TFunction<"translation", undefined>;
  adminBusy: boolean;
  adminStatusReason: string;
  onStatusReasonChange: (value: string) => void;
  onStatusAction: (action: "lock" | "ban" | "unlock" | "reactivate") => void;
};

export function AdminAccessPane({
  t,
  adminBusy,
  adminStatusReason,
  onStatusReasonChange,
  onStatusAction,
}: AccessPaneProps) {
  return (
    <div className="admin-card compact">
      <h3>{t("account.web.adminAccessHeading", "Access control")}</h3>
      <p>{t("account.web.adminAccessCopy", "Lock, ban, or restore access when needed.")}</p>
      <label>
        {t("account.web.adminStatusReason", "Account status note")}
        <textarea
          value={adminStatusReason}
          onChange={(event) => onStatusReasonChange(event.target.value)}
          placeholder={t(
            "account.web.adminStatusReasonPlaceholder",
            "Explain why you are locking, banning, or restoring this account."
          )}
          disabled={adminBusy}
        />
      </label>
      <div className="admin-actions compact wrap">
        <button type="button" className="web-account-secondary" onClick={() => onStatusAction("lock")} disabled={adminBusy}>
          {t("account.web.lockAccount", "Lock")}
        </button>
        <button type="button" className="web-account-danger" onClick={() => onStatusAction("ban")} disabled={adminBusy}>
          {t("account.web.banAccount", "Ban")}
        </button>
        <button
          type="button"
          className="web-account-secondary"
          onClick={() => onStatusAction("unlock")}
          disabled={adminBusy}
        >
          {t("account.web.unlockAccount", "Unlock")}
        </button>
        <button
          type="button"
          className="web-account-primary"
          onClick={() => onStatusAction("reactivate")}
          disabled={adminBusy}
        >
          {t("account.web.reactivateAccount", "Reactivate")}
        </button>
      </div>
    </div>
  );
}

type ProfilePaneProps = {
  t: TFunction<"translation", undefined>;
  adminBusy: boolean;
  adminEditFields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
  onEditFieldChange: (field: keyof ProfilePaneProps["adminEditFields"], value: string) => void;
  onProfileSave: () => void;
};

export function AdminProfilePane({
  t,
  adminBusy,
  adminEditFields,
  onEditFieldChange,
  onProfileSave,
}: ProfilePaneProps) {
  return (
    <div className="admin-card compact">
      <h3>{t("account.web.adminProfileHeading", "Profile & password")}</h3>
      <p>{t("account.web.adminProfileCopy", "Update contact info or rotate the user password in emergencies.")}</p>
      <div className="admin-form-grid compact">
        <label>
          {t("account.web.firstNameLabel", "First name")}
          <input
            type="text"
            value={adminEditFields.firstName}
            onChange={(event) => onEditFieldChange("firstName", event.target.value)}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.lastNameLabel", "Last name")}
          <input
            type="text"
            value={adminEditFields.lastName}
            onChange={(event) => onEditFieldChange("lastName", event.target.value)}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.contactEmail", "Contact email")}
          <input
            type="email"
            value={adminEditFields.email}
            onChange={(event) => onEditFieldChange("email", event.target.value)}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.phone", "Phone")}
          <input
            type="text"
            value={adminEditFields.phone}
            onChange={(event) => onEditFieldChange("phone", event.target.value)}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.adminPasswordLabel", "New password")}
          <input
            type="text"
            value={adminEditFields.password}
            onChange={(event) => onEditFieldChange("password", event.target.value)}
            placeholder={t("account.web.adminPasswordPlaceholder", "Leave blank to keep current password")}
            disabled={adminBusy}
          />
        </label>
      </div>
      <div className="admin-actions compact">
        <button type="button" className="web-account-primary" onClick={onProfileSave} disabled={adminBusy}>
          {t("account.web.adminSaveProfile", "Save profile changes")}
        </button>
      </div>
    </div>
  );
}
