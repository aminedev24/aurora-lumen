// ==============================================================================
// File: /frontend/src/pages/account/AdminDashboard.tsx
// Description: Aurora Lumen — Admin Dashboard (Owner-only)
// Notes:
// - Visible only when user.role === "owner"
// - Uses AccountPage theme and Aurora Lumen layout
// ==============================================================================

import React, { useMemo, useRef, useState } from "react";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "./AdminDashboard.css";
import { useAuthStore } from "@/stores/authStore";
import { useWebAuth } from "@/lib/webAuth";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { adminSendMail } from "@/lib/api";

type SectionKey = "users" | "subscriptions" | "mailing";

export default function AdminDashboard() {
  const { user, isLoggedIn } = useAuthStore();
  const { user: webUser } = useWebAuth();
  const [active, setActive] = useState<SectionKey>("users");
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    users: null,
    subscriptions: null,
    mailing: null,
  });
  const defaultTemplates = useMemo(
    () => [
      {
        id: "thanks-upgrade",
        title: "Thank you for upgrading to Aurora Plus",
        content: "Hello,\n\nThank you for supporting Aurora Plus! Your membership helps us keep Aurora private-by-default and ad-free. If you have any feedback or need help, just hit reply.\n\nAurora Lumen Team",
      },
      {
        id: "welcome-trial",
        title: "Welcome to Aurora",
        content: "Hi there,\n\nWelcome to Aurora Lumen! Let us know what you’re working on and we’ll tailor tips for your workflows.\n\n– Aurora",
      },
    ],
    [],
  );
  const [templates, setTemplates] = useState(defaultTemplates);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplates[0]?.id || "");
  const [mailRecipient, setMailRecipient] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState<string | null>(null);

  const goTo = (key: SectionKey) => {
    setActive(key);
    const el = sectionRefs.current[key];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Access control
  const webRoles = useMemo(() => {
    if (!Array.isArray(webUser?.roles)) return [];
    return webUser.roles
      .map((role) => (typeof role === "string" ? role.trim().toLowerCase() : ""))
      .filter(Boolean);
  }, [webUser?.roles]);
  const singleWebRole = typeof webUser?.role === "string" ? webUser.role.trim().toLowerCase() : "";
  const webOwnerFlag = Boolean(webUser?.is_owner || webUser?.isOwner);
  const isOwner =
    (isLoggedIn && user?.role === "owner") ||
    webOwnerFlag ||
    webRoles.includes("owner") ||
    singleWebRole === "owner";

  if (!isOwner) {
    return (
      <div className="landing account-page">
        <TopBar />
        <section className="admin-denied">
          <h1>Access Denied</h1>
          <p>You don’t have permission to view this page.</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="landing account-page admin-dashboard">
      <TopBar />

      <section className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage Aurora Lumen users, subscriptions, and mailings.
        </p>
      </section>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <button
            onClick={() => goTo("users")}
            className={`admin-nav-btn ${active === "users" ? "active" : ""}`}
          >
            Users Management
          </button>
          <button
            onClick={() => goTo("subscriptions")}
            className={`admin-nav-btn ${active === "subscriptions" ? "active" : ""}`}
          >
            Subscription Management
          </button>
          <button
            onClick={() => goTo("mailing")}
            className={`admin-nav-btn ${active === "mailing" ? "active" : ""}`}
          >
            Mailing
          </button>
        </aside>

        {/* Content */}
        <main className="admin-content">
          {/* USERS MANAGEMENT */}
          <section
            id="users"
            ref={(el) => {
              sectionRefs.current.users = el;
            }}
            className="admin-section"
          >
            <AdminUsersPanel />
          </section>

          {/* SUBSCRIPTION MANAGEMENT */}
          <section
            id="subscriptions"
            ref={(el) => {
              sectionRefs.current.subscriptions = el;
            }}
            className="admin-section"
          >
            <h2>Subscription Management</h2>
            <p>Grant or cancel Aurora Plus memberships.</p>
            <div className="admin-card">
              <form className="admin-form">
                <label>
                  User Email:
                  <input type="email" placeholder="user@aurora.com" />
                </label>
                <label>
                  Action:
                  <select>
                    <option>Grant Aurora Plus</option>
                    <option>Cancel Membership</option>
                  </select>
                </label>
                <button type="submit" className="admin-primary-btn">Apply</button>
              </form>
            </div>
          </section>

          {/* MAILING */}
          <section
            id="mailing"
            ref={(el) => {
              sectionRefs.current.mailing = el;
            }}
            className="admin-section"
          >
            <h2>Mailing</h2>
            <p>Send thank-you messages or newsletters to users.</p>

            <div className="admin-card">
              <h3>Create Mail Template</h3>
              <form
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!templateTitle.trim() || !templateContent.trim()) {
                    alert("Template title and content are required.");
                    return;
                  }
                  const newTemplate = {
                    id: globalThis.crypto?.randomUUID
                      ? globalThis.crypto.randomUUID()
                      : Math.random().toString(36).slice(2),
                    title: templateTitle.trim(),
                    content: templateContent.trim(),
                  };
                  setTemplates((prev) => [...prev, newTemplate]);
                  setTemplateTitle("");
                  setTemplateContent("");
                  setSelectedTemplateId(newTemplate.id);
                }}
              >
                <label>
                  Template title:
                  <input
                    type="text"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    placeholder="Subject / template name"
                  />
                </label>
                <label>
                  Template content:
                  <textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Write the email content..."
                    rows={5}
                  />
                </label>
                <button type="submit" className="admin-primary-btn">
                  Add Template
                </button>
              </form>
              {templates.length > 0 && (
                <ul className="admin-template-list">
                  {templates.map((tpl) => (
                    <li key={tpl.id} className={selectedTemplateId === tpl.id ? "active" : ""}>
                      <button type="button" onClick={() => setSelectedTemplateId(tpl.id)}>
                        {tpl.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-card">
              <h3>Send Template</h3>
              <form
                className="admin-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const template = templates.find((tpl) => tpl.id === selectedTemplateId);
                  if (!template) {
                    alert("Select a template first.");
                    return;
                  }
                  if (!mailRecipient.trim()) {
                    alert("Recipient email is required.");
                    return;
                  }
                  setSendingMail(true);
                  setMailStatus(null);
                  try {
                    await adminSendMail({
                      email: mailRecipient.trim(),
                      subject: template.title,
                      content: template.content,
                    });
                    setMailStatus("Email sent ✓");
                    setMailRecipient("");
                  } catch (err: any) {
                    const detail = err?.message || "Failed to send email.";
                    setMailStatus(detail);
                  } finally {
                    setSendingMail(false);
                  }
                }}
              >
                <label>
                  Recipient email:
                  <input
                    type="email"
                    value={mailRecipient}
                    onChange={(e) => setMailRecipient(e.target.value)}
                    placeholder="user@example.com"
                  />
                </label>
                <label>
                  Template:
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    <option value="">Select template…</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.title}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedTemplateId && (
                  <div className="admin-template-preview">
                    <strong>Preview:</strong>
                    <pre>{templates.find((tpl) => tpl.id === selectedTemplateId)?.content}</pre>
                  </div>
                )}
                <button type="submit" className="admin-primary-btn" disabled={sendingMail}>
                  {sendingMail ? "Sending…" : "Send Email"}
                </button>
                {mailStatus && <p className="admin-hint">{mailStatus}</p>}
              </form>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
