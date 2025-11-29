// ==============================================================================
// File: /frontend/src/pages/ContactPage.tsx
// Description: Aurora Lumen Contact Page — full redesign with glassmorphic form,
// luminous gradient background, and modal-style Aurora glow confirmation.
// ==============================================================================
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, email, message } = formData;
    if (!name || !email || !message) {
      setError("⚠️ Please fill out all fields.");
      return;
    }
    setError(null);
    setShowModal(true);
    setFormData({ name: "", email: "", message: "" });

    setTimeout(() => setShowModal(false), 3200);
  }

  return (
    <div className="landing contact-page">
      <TopBar />

      {/* ===== Hero Section ===== */}
      <section className="contact-hero">
        <div className="page-shell">
          <h1>{t("contact.title", "Get in Touch")}</h1>
          <p>{t("contact.subtitle", "We’d love to hear from you.")}</p>
        </div>
      </section>

      {/* ===== Glass Form Section ===== */}
      <section className="contact-body">
        <div className="page-shell">
          <form className="contact-form-glass" onSubmit={handleSubmit}>
            <h2>{t("contact.formTitle", "Send us a message")}</h2>
            {error && <div className="contact-error">{error}</div>}

            <label>
              <span>{t("contact.name", "Name")}</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("contact.namePlaceholder", "Your name") || ""}
                required
              />
            </label>

            <label>
              <span>{t("contact.email", "Email")}</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("contact.emailPlaceholder", "you@example.com") || ""}
                required
              />
            </label>

            <label>
              <span>{t("contact.message", "Message")}</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t("contact.messagePlaceholder", "Write your message...") || ""}
                required
              />
            </label>

            <button type="submit" className="hp-btn hp-btn--primary">
              {t("contact.submit", "Send Message")}
            </button>
          </form>
        </div>
      </section>

      {/* ===== Aurora Modal Confirmation ===== */}
      {showModal && (
        <div className="contact-modal-overlay">
          <div className="contact-modal">
            <div className="contact-modal-glow" />
            <div className="contact-modal-content">
              <h3>{t("contact.thanks", "Thank you!")}</h3>
              <p>
                {t(
                  "contact.confirmation",
                  "Your message has been received. Aurora’s team will reply soon."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
