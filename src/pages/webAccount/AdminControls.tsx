import React, { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import {
  AdminOverviewPane,
  AdminPlanPane,
  AdminAccessPane,
  AdminProfilePane,
  type AdminStatusSummary,
} from "./AdminPaneSections";
import { AdminUsersPanel } from "../account/AdminUsersPanel";
import { MailTemplatesPane } from "./MailTemplatesPane";
import { useAdminUserLookup } from "./hooks/useAdminUserLookup";
import { useAdminActions } from "./hooks/useAdminActions";

type AdminControlsProps = {
  t: TFunction<"translation", undefined>;
  isAdmin: boolean;
  isOwner: boolean;
};

export function AdminControls({ t, isAdmin, isOwner }: AdminControlsProps) {
  const {
    adminEmail,
    adminTarget,
    adminAppUser,
    adminEditFields,
    adminBusy,
    adminError,
    adminMessage,
    setAdminEditFields,
    setAdminError,
    setAdminMessage,
    setAdminBusy,
    applyResponse,
    handleLookup,
    handleAdminEmailChange,
  } = useAdminUserLookup();

  const {
    adminReason,
    adminNote,
    adminStatusReason,
    setAdminReason,
    setAdminNote,
    setAdminStatusReason,
    handleGrantPlus,
    handleRevokePlus,
    handlePromote,
    handleDemote,
    handleStatus,
    handleProfileSave,
  } = useAdminActions({
    selectedEmail: adminTarget?.email || null,
    adminEmail,
    adminEditFields,
    isOwner,
    setAdminBusy,
    setAdminError,
    setAdminMessage,
    applyResponse,
  });

  const adminTargetRoles = adminTarget?.roles ?? [];
  const adminTargetPlanLabel = adminTarget?.plan_actual || adminTarget?.plan || "Free";
  const adminTargetEffectivePlan = adminTarget?.plan_effective || adminTargetPlanLabel;
  const adminTargetStatus = adminTarget?.plan_status || "free";
  const adminTargetVerifiedLabel = adminTarget?.email_verified ? "Verified" : "Pending verification";

  const statusDetails = useMemo<AdminStatusSummary | null>(() => {
    if (!adminAppUser) return null;
    return {
      status: adminAppUser.status,
      lockedAt: adminAppUser.lockedAt,
      lockedReason: adminAppUser.lockedReason,
      bannedAt: adminAppUser.bannedAt,
      bannedReason: adminAppUser.bannedReason,
      deletedAt: adminAppUser.deletedAt,
    };
  }, [adminAppUser]);

  type AdminPane = "overview" | "plan" | "access" | "profile" | "mail";
  const [activePane, setActivePane] = useState<AdminPane>("overview");
  const paneTabs: { id: AdminPane; label: string }[] = [
    { id: "overview", label: t("account.web.adminPaneOverview", "Overview") },
    { id: "plan", label: t("account.web.adminPanePlan", "Plans & roles") },
    { id: "access", label: t("account.web.adminPaneAccess", "Access control") },
    { id: "profile", label: t("account.web.adminPaneProfile", "Profile & password") },
    { id: "mail", label: t("account.web.adminPaneMail", "Mail templates") },
  ];

  if (!isAdmin) {
    return null;
  }

  const paneContent: Record<AdminPane, React.JSX.Element> = {
    overview: (
      <AdminOverviewPane
        t={t}
        adminTarget={adminTarget}
        adminAppUser={adminAppUser}
        planLabel={adminTargetPlanLabel}
        effectivePlan={adminTargetEffectivePlan}
        planStatus={adminTargetStatus}
        roles={adminTargetRoles}
        verifiedLabel={adminTargetVerifiedLabel}
        statusDetails={statusDetails}
      />
    ),
    plan: (
      <AdminPlanPane
        t={t}
        adminBusy={adminBusy}
        adminReason={adminReason}
        adminNote={adminNote}
        isOwner={isOwner}
        hasAdminRole={adminTargetRoles.includes("admin")}
        onReasonChange={setAdminReason}
        onNoteChange={setAdminNote}
        onGrantPlus={handleGrantPlus}
        onRevokePlus={handleRevokePlus}
        onPromote={handlePromote}
        onDemote={handleDemote}
      />
    ),
    access: (
      <AdminAccessPane
        t={t}
        adminBusy={adminBusy}
        adminStatusReason={adminStatusReason}
        onStatusReasonChange={setAdminStatusReason}
        onStatusAction={handleStatus}
      />
    ),
    profile: (
      <AdminProfilePane
        t={t}
        adminBusy={adminBusy}
        adminEditFields={adminEditFields}
        onEditFieldChange={(field, value) =>
          setAdminEditFields((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onProfileSave={handleProfileSave}
      />
    ),
    mail: <MailTemplatesPane t={t} adminTarget={adminTarget} />,
  };

  return (
    <div className="web-account-admin">
      <header>
        <div>
          <h2>{t("account.web.adminShortTitle", "Admin")}</h2>
          <p>
            {t(
              "account.web.adminShortCopy",
              "Lookup members, manage plans, and recover access without leaving your account."
            )}
          </p>
        </div>
      </header>

      <form className="admin-lookup-inline" onSubmit={handleLookup}>
        <label htmlFor="web-admin-email">{t("account.web.adminEmailLabel", "User email")}</label>
        <div className="admin-lookup-inputs">
          <input
            id="web-admin-email"
            type="email"
            value={adminEmail}
            onChange={(event) => handleAdminEmailChange(event.target.value)}
            placeholder="user@example.com"
            disabled={adminBusy}
            required
          />
          <button type="submit" className="web-account-primary" disabled={adminBusy}>
            {adminBusy ? t("account.web.adminLoading", "Working…") : t("account.web.adminLoad", "Load user")}
          </button>
        </div>
      </form>

      <div className="admin-selected-chip">
        {adminTarget ? (
          <>
            {t("account.web.adminSelectedUser", "Selected user")}: <strong>{adminTarget.email}</strong>
          </>
        ) : (
          t("account.web.adminNoUser", "No user selected")
        )}
      </div>

      {adminError && <div className="web-account-alert error">{adminError}</div>}
      {adminMessage && <div className="web-account-alert success">{adminMessage}</div>}

      <div className="admin-pane-nav">
        {paneTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activePane === tab.id ? "active" : ""}
            onClick={() => setActivePane(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-pane-content">{paneContent[activePane]}</div>

      {(isOwner || isAdmin) && (
        <div className="admin-users-embedded">
          <AdminUsersPanel
            variant="embedded"
            title={t("account.web.adminDirectoryTitle", "Users directory")}
            description={t(
              "account.web.adminDirectoryCopy",
              "Scroll through every Aurora account, filter by IP or region, and open detailed controls instantly."
            )}
          />
        </div>
      )}
    </div>
  );
}
