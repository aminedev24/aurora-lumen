import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { adminSendMailTemplate, type AdminWebAccountUser } from "@/lib/webAuth";

type MailTemplatesPaneProps = {
  t: TFunction<"translation", undefined>;
  adminTarget: AdminWebAccountUser | null;
};

export function MailTemplatesPane({ t, adminTarget }: MailTemplatesPaneProps) {
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
          "Hi there,\n\nWelcome to Aurora Lumen. Tell us what you're building and we'll tailor tips for your workflow.\n\n– Aurora",
      },
    ],
    []
  );

  const [mailTemplates, setMailTemplates] = useState(defaultMailTemplates);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultMailTemplates[0]?.id || "");
  const [mailRecipient, setMailRecipient] = useState("");
  const [mailStatus, setMailStatus] = useState<string | null>(null);
  const [mailSending, setMailSending] = useState(false);

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

  return (
    <div className="admin-pane-grid">
      <div className="admin-card">
        <h3>{t("account.web.mailTemplatesHeading", "Create template")}</h3>
        <p>
          {t(
            "account.web.mailTemplatesCopy",
            "Give your template a title and body, then reuse it whenever you contact members."
          )}
        </p>
        <div className="mail-template-toolbar">
          <select 
            value={selectedTemplateId} 
            onChange={(event) => setSelectedTemplateId(event.target.value)}
            aria-label={t("account.web.mailTemplateSelect", "Template")}
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
            const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
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
          {t("account.web.mailSendCopy", "Send the selected template to the loaded user or any email address.")}
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
          <button type="button" className="web-account-primary" onClick={handleSendTemplate} disabled={mailSending}>
            {mailSending ? t("account.web.mailSending", "Sending…") : t("account.web.mailSendAction", "Send email")}
          </button>
          {mailStatus && <p className="admin-hint">{mailStatus}</p>}
        </div>
      </div>
    </div>
  );
}
