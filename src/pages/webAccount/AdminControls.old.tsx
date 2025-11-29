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
  const { user: webAuthUser } = useWebAuth();
  const [adminEmail, setAdminEmail] = useState(webAuthUser?.email ?? "");
  const [adminTarget, setAdminTarget] = useState<AdminWebAccountUser | null>(null);
  const [adminAppUser, setAdminAppUser] = useState<AdminAppUser | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [adminReason, setAdminReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [adminStatusReason, setAdminStatusReason] = useState("");
  const [adminEditFields, setAdminEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const defaultMailTemplates = useMemo(
    () => [
      {
        id: "thanks-plus",
        title: "Thank you for upgrading to Aurora Plus",
        content:
          "Hello,\n\nThank you for supporting Aurora Plus! Your membership helps us keep Aurora private-by-default and ad-free.\n\nIf you ever have questions or want help building workflows, just reply to this email.\n\nAurora Lumen Team",
      },
      {
        id: "welcome-note",
        title: "Welcome to Aurora",
        content:
          "Hi there,\n\nWelcome to Aurora Lumen. Tell us what you’re building and we’ll tailor tips for your workflow.\n\n– Aurora",
      },
    ],
    [],
  );
  const [mailTemplates, setMailTemplates] = useState(defaultMailTemplates);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultMailTemplates[0]?.id || "");
  const [mailRecipient, setMailRecipient] = useState("");
  const [mailStatus, setMailStatus] = useState<string | null>(null);
  const [mailSending, setMailSending] = useState(false);

  useEffect(() => {
    if (webAuthUser?.email) {
      setAdminEmail(webAuthUser.email);
    }
  }, [webAuthUser?.email]);

  useEffect(() => {
    if (adminTarget?.email) {
      setMailRecipient(adminTarget.email);
    }
  }, [adminTarget?.email]);

  useEffect(() => {
    if (!mailTemplates.length) {
      setSelectedTemplateId("");
      return;
    }
    if (!selectedTemplateId || !mailTemplates.some((tpl) => tpl.id === selectedTemplateId)) {
      setSelectedTemplateId(mailTemplates[0].id);
    }
  }, [mailTemplates, selectedTemplateId]);

  const resetFeedback = useCallback(() => {
    setAdminMessage(null);
    setAdminError(null);
  }, []);

  const applyResponse = useCallback((payload: AdminUserResponse) => {
    setAdminTarget(payload.user);
    setAdminAppUser(payload.appUser ?? null);
    const nextEmail = payload.appUser?.email || payload.user.email || "";
    setAdminEmail(nextEmail);
    setSelectedEmail(nextEmail ? nextEmail.trim().toLowerCase() : null);
    setAdminEditFields({
      firstName: payload.appUser?.firstName ?? "",
      lastName: payload.appUser?.lastName ?? "",
      email: nextEmail,
      phone: payload.appUser?.phone ?? "",
      password: "",
    });
  }, []);

  const handleLookup = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!adminEmail.trim()) {
        setAdminError("Enter an email address to look up.");
        setAdminTarget(null);
        setAdminAppUser(null);
        setSelectedEmail(null);
        return;
      }
      setAdminBusy(true);
      resetFeedback();
      try {
        const payload = await adminLookupWebAccountUser(adminEmail.trim());
        applyResponse(payload);
        setAdminMessage("User loaded.");
      } catch (err: any) {
        console.error("[web-account] admin lookup failed", err);
        setAdminTarget(null);
        setAdminAppUser(null);
        setSelectedEmail(null);
        setAdminError(typeof err?.message === "string" ? err.message : "Unable to load that user.");
      } finally {
        setAdminBusy(false);
      }
    },
    [adminEmail, applyResponse, resetFeedback]
  );

  const requireTarget = useCallback(() => {
    if (!selectedEmail) {
      setAdminError("Load a user first.");
      return false;
    }
    return true;
  }, [selectedEmail]);

  const handleAdminEmailChange = useCallback(
    (value: string) => {
      setAdminEmail(value);
      const normalized = value.trim().toLowerCase();
      if (selectedEmail && normalized !== selectedEmail) {
        setSelectedEmail(null);
        setAdminTarget(null);
        setAdminAppUser(null);
      }
    },
    [selectedEmail]
  );

  const handleGrantPlus = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminGrantWebPlusAccess({
        email: targetEmail,
        reason: adminReason.trim() || undefined,
        supportNote: adminNote.trim() || undefined,
      });
      applyResponse(payload);
      setAdminMessage("Aurora Plus access granted.");
    } catch (err: any) {
      console.error("[web-account] grant plus failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to grant Aurora Plus.");
    } finally {
      setAdminBusy(false);
    }
  }, [adminTarget, adminReason, adminNote, resetFeedback, applyResponse, requireTarget]);

  const handleRevokePlus = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminRevokeWebPlusAccess({
        email: targetEmail,
        reason: adminReason.trim() || undefined,
        supportNote: adminNote.trim() || undefined,
      });
      applyResponse(payload);
      setAdminMessage("Aurora Plus access revoked.");
    } catch (err: any) {
      console.error("[web-account] revoke plus failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to revoke Aurora Plus.");
    } finally {
      setAdminBusy(false);
    }
  }, [adminTarget, adminReason, adminNote, resetFeedback, applyResponse, requireTarget]);

  const handlePromote = useCallback(async () => {
    if (!isOwner) {
      setAdminError("Only the owner can grant admin roles.");
      return;
    }
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminAssignWebRole(targetEmail);
      applyResponse(payload);
      setAdminMessage("Admin role granted.");
    } catch (err: any) {
      console.error("[web-account] assign admin failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to grant admin role.");
    } finally {
      setAdminBusy(false);
    }
  }, [adminTarget, isOwner, resetFeedback, applyResponse, requireTarget]);

  const handleDemote = useCallback(async () => {
    if (!isOwner) {
      setAdminError("Only the owner can remove admin roles.");
      return;
    }
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminRemoveWebRole(targetEmail);
      applyResponse(payload);
      setAdminMessage("Admin role removed.");
    } catch (err: any) {
      console.error("[web-account] remove admin failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to remove admin role.");
    } finally {
      setAdminBusy(false);
    }
  }, [adminTarget, isOwner, resetFeedback, applyResponse, requireTarget]);

  const handleStatus = useCallback(
    async (action: "lock" | "unlock" | "ban" | "reactivate") => {
      resetFeedback();
      if (!requireTarget()) return;
      setAdminBusy(true);
      try {
        const targetEmail = selectedEmail as string;
        const payload = await adminUpdateWebUserStatus({
          email: targetEmail,
          action,
          reason: adminStatusReason.trim() || undefined,
        });
        applyResponse(payload);
        setAdminMessage(
          action === "reactivate"
            ? "User reactivated."
            : action === "unlock"
            ? "Account unlocked."
            : action === "ban"
            ? "User banned."
            : "Account locked."
        );
      } catch (err: any) {
        console.error("[web-account] status update failed", err);
        setAdminError(typeof err?.message === "string" ? err.message : "Unable to update user status.");
      } finally {
        setAdminBusy(false);
      }
    },
    [adminStatusReason, resetFeedback, applyResponse, requireTarget]
  );

  const handleProfileSave = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminUpdateWebUserProfile({
        email: targetEmail,
        firstName: adminEditFields.firstName,
        lastName: adminEditFields.lastName,
        phone: adminEditFields.phone,
        newEmail: adminEditFields.email && adminEditFields.email !== adminEmail ? adminEditFields.email : undefined,
        password: adminEditFields.password.trim() ? adminEditFields.password : undefined,
      });
      applyResponse(payload);
      setAdminMessage("Profile updated.");
    } catch (err: any) {
      console.error("[web-account] admin profile update failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to update profile.");
    } finally {
      setAdminBusy(false);
    }
  }, [adminEmail, adminEditFields, resetFeedback, applyResponse, requireTarget]);

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

  const renderOverviewPane = () => {
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
            <dd>{adminTargetPlanLabel}</dd>
          </div>
          <div>
            <dt>{t("account.web.planEffective", "Effective plan")}</dt>
            <dd>{adminTargetEffectivePlan}</dd>
          </div>
          <div>
            <dt>{t("account.web.planStatus", "Plan status")}</dt>
            <dd>{adminTargetStatus}</dd>
          </div>
          <div>
            <dt>{t("account.web.roles", "Roles")}</dt>
            <dd>{adminTargetRoles.length ? adminTargetRoles.join(", ") : t("account.web.none", "None")}</dd>
          </div>
          <div>
            <dt>{t("account.web.verification", "Verification")}</dt>
            <dd>{adminTargetVerifiedLabel}</dd>
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
  };

  const renderPlanPane = () => (
    <div className="admin-pane-grid">
      <div className="admin-card compact">
        <h3>{t("account.web.adminPlusHeading", "Aurora Plus access")}</h3>
        <p>{t("account.web.adminPlusCopy", "Grant or revoke Plus while leaving an internal note for other admins.")}</p>
        <label>
          {t("account.web.adminReason", "Reason / context")}
          <textarea
            value={adminReason}
            onChange={(event) => setAdminReason(event.target.value)}
            placeholder={t("account.web.adminReasonPlaceholder", "Why are you changing this plan?")}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.adminNote", "Support note (optional)")}
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder={t("account.web.adminNotePlaceholder", "Internal note for other admins.")}
            disabled={adminBusy}
          />
        </label>
        <div className="admin-actions compact">
          <button type="button" className="web-account-primary" onClick={handleGrantPlus} disabled={adminBusy}>
            {t("account.web.adminGrantPlus", "Grant Aurora Plus")}
          </button>
          <button type="button" className="web-account-secondary" onClick={handleRevokePlus} disabled={adminBusy}>
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
            onClick={handlePromote}
            disabled={adminBusy || !isOwner || adminTargetRoles.includes("admin")}
          >
            {t("account.web.adminGrantRole", "Grant Admin")}
          </button>
          <button
            type="button"
            className="web-account-danger"
            onClick={handleDemote}
            disabled={adminBusy || !isOwner || !adminTargetRoles.includes("admin")}
          >
            {t("account.web.adminRemoveRole", "Remove Admin")}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccessPane = () => (
    <div className="admin-card compact">
      <h3>{t("account.web.adminAccessHeading", "Access control")}</h3>
      <p>{t("account.web.adminAccessCopy", "Lock, ban, or restore access when needed.")}</p>
      <label>
        {t("account.web.adminStatusReason", "Account status note")}
        <textarea
          value={adminStatusReason}
          onChange={(event) => setAdminStatusReason(event.target.value)}
          placeholder={t(
            "account.web.adminStatusReasonPlaceholder",
            "Explain why you are locking, banning, or restoring this account."
          )}
          disabled={adminBusy}
        />
      </label>
      <div className="admin-actions compact wrap">
        <button type="button" className="web-account-secondary" onClick={() => handleStatus("lock")} disabled={adminBusy}>
          {t("account.web.lockAccount", "Lock")}
        </button>
        <button type="button" className="web-account-danger" onClick={() => handleStatus("ban")} disabled={adminBusy}>
          {t("account.web.banAccount", "Ban")}
        </button>
        <button type="button" className="web-account-secondary" onClick={() => handleStatus("unlock")} disabled={adminBusy}>
          {t("account.web.unlockAccount", "Unlock")}
        </button>
        <button type="button" className="web-account-primary" onClick={() => handleStatus("reactivate")} disabled={adminBusy}>
          {t("account.web.reactivateAccount", "Reactivate")}
        </button>
      </div>
    </div>
  );

  const renderProfilePane = () => (
    <div className="admin-card compact">
      <h3>{t("account.web.adminProfileHeading", "Profile & password")}</h3>
      <p>{t("account.web.adminProfileCopy", "Update contact info or rotate the user password in emergencies.")}</p>
      <div className="admin-form-grid compact">
        <label>
          {t("account.web.firstNameLabel", "First name")}
          <input
            type="text"
            value={adminEditFields.firstName}
            onChange={(event) => setAdminEditFields((prev) => ({ ...prev, firstName: event.target.value }))}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.lastNameLabel", "Last name")}
          <input
            type="text"
            value={adminEditFields.lastName}
            onChange={(event) => setAdminEditFields((prev) => ({ ...prev, lastName: event.target.value }))}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.contactEmail", "Contact email")}
          <input
            type="email"
            value={adminEditFields.email}
            onChange={(event) => setAdminEditFields((prev) => ({ ...prev, email: event.target.value }))}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.phone", "Phone")}
          <input
            type="text"
            value={adminEditFields.phone}
            onChange={(event) => setAdminEditFields((prev) => ({ ...prev, phone: event.target.value }))}
            disabled={adminBusy}
          />
        </label>
        <label>
          {t("account.web.adminPasswordLabel", "New password")}
          <input
            type="text"
            value={adminEditFields.password}
            onChange={(event) => setAdminEditFields((prev) => ({ ...prev, password: event.target.value }))}
            placeholder={t("account.web.adminPasswordPlaceholder", "Leave blank to keep current password")}
            disabled={adminBusy}
          />
        </label>
      </div>
      <div className="admin-actions compact">
        <button type="button" className="web-account-primary" onClick={handleProfileSave} disabled={adminBusy}>
          {t("account.web.adminSaveProfile", "Save profile changes")}
        </button>
      </div>
    </div>
  );

  const selectedTemplate = mailTemplates.find((tpl) => tpl.id === selectedTemplateId) || null;

  const handleSendTemplate = useCallback(async () => {
    if (!selectedTemplate) {
      setMailStatus(t("account.web.mailTemplateSelectOption", "Select template…"));
      return;
    }
    const email = mailRecipient.trim();
    if (!email) {
      setMailStatus(t("account.web.mailRecipientRequired", "Enter a recipient email."));
      return;
    }
    setMailSending(true);
    setMailStatus(null);
    try {
      await adminSendMailTemplate({
        email,
        subject: selectedTemplate.title,
        content: selectedTemplate.content,
      });
      setMailStatus(t("account.web.mailSent", "Email sent."));
    } catch (err: any) {
      setMailStatus(typeof err?.message === "string" ? err.message : "Failed to send email.");
    } finally {
      setMailSending(false);
    }
  }, [mailRecipient, selectedTemplate, t]);

  const renderMailPane = () => (
    <div className="admin-pane-grid">
      <div className="admin-card">
        <h3>{t("account.web.mailTemplatesHeading", "Create template")}</h3>
        <p>
          {t(
            "account.web.mailTemplatesCopy",
            "Give your template a title and body, then reuse it whenever you contact members.",
          )}
        </p>
        <div className="mail-template-toolbar">
          <select
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
          >
            <option value="">{t("account.web.mailTemplateSelectOption", "Select template…")}</option>
            {mailTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="web-account-secondary"
            onClick={() => {
              setNewTemplateTitle("");
              setNewTemplateContent("");
              setSelectedTemplateId("");
            }}
          >
            {t("account.web.mailTemplateNew", "New template")}
          </button>
          {selectedTemplateId && (
            <button
              type="button"
              className="web-account-danger"
              onClick={() => {
                setMailTemplates((prev) => prev.filter((tpl) => tpl.id !== selectedTemplateId));
                setSelectedTemplateId("");
                setMailStatus(t("account.web.mailTemplateDeleted", "Template deleted."));
              }}
            >
              {t("account.web.mailTemplateDelete", "Delete")}
            </button>
          )}
        </div>
        <form
          className="admin-form-grid compact"
          onSubmit={(event) => {
            event.preventDefault();
            const title = newTemplateTitle.trim();
            const content = newTemplateContent.trim();
            if (!title || !content) {
              setMailStatus(t("account.web.mailTemplateRequired", "Template title and content are required."));
              return;
            }
            const id =
              globalThis.crypto?.randomUUID?.() ??
              Math.random().toString(36).slice(2);
            const nextTemplate = { id, title, content };
            setMailTemplates((prev) => [...prev, nextTemplate]);
            setNewTemplateTitle("");
            setNewTemplateContent("");
            setSelectedTemplateId(nextTemplate.id);
            setMailStatus(t("account.web.mailTemplateAdded", "Template added."));
          }}
        >
          <label>
            {t("account.web.mailTemplateTitle", "Template title / subject")}
            <input
              type="text"
              value={newTemplateTitle}
              onChange={(event) => setNewTemplateTitle(event.target.value)}
              placeholder={t("account.web.mailTemplateTitlePlaceholder", "Thank you for upgrading")}
            />
          </label>
          <label>
            {t("account.web.mailTemplateContent", "Template content")}
            <textarea
              rows={5}
              value={newTemplateContent}
              onChange={(event) => setNewTemplateContent(event.target.value)}
              placeholder={t("account.web.mailTemplateContentPlaceholder", "Hello and thank you for joining Aurora…")}
            />
          </label>
          <button type="submit" className="web-account-primary">
            {t("account.web.mailTemplateAdd", "Save template")}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3>{t("account.web.mailSendHeading", "Send template")}</h3>
        <p>
          {t(
            "account.web.mailSendCopy",
            "Send the selected template to the loaded user or any email address.",
          )}
        </p>
        <div className="admin-form-grid compact">
          <label>
            {t("account.web.mailRecipient", "Recipient email")}
            <input
              type="email"
              value={mailRecipient}
              onChange={(event) => setMailRecipient(event.target.value)}
              placeholder={t("account.web.mailRecipientPlaceholder", "user@example.com")}
            />
          </label>
          <div className="mail-template-dropdown">
            <label htmlFor="mail-template-select">{t("account.web.mailTemplateSelect", "Template")}</label>
            <div className="dropdown-wrapper">
              <select
                id="mail-template-select"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
              >
                <option value="">{t("account.web.mailTemplateSelectOption", "Select template…")}</option>
                {mailTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedTemplate && (
            <div className="admin-template-preview">
              <strong>{selectedTemplate.title}</strong>
              <pre>{selectedTemplate.content}</pre>
            </div>
          )}
          <button
            type="button"
            className="web-account-primary"
            onClick={handleSendTemplate}
            disabled={mailSending}
          >
            {mailSending
              ? t("account.web.mailSending", "Sending…")
              : t("account.web.mailSendAction", "Send email")}
          </button>
          {mailStatus && <p className="admin-hint">{mailStatus}</p>}
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return null;
  }

  const paneContent: Record<AdminPane, JSX.Element> = {
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
    mail: renderMailPane(),
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
