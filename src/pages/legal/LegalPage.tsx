// ==============================================================================
// File: /frontend/src/pages/LegalPage.tsx
// Description: Aurora Lumen Legal & Safety information (with i18n + TopBar)
// ==============================================================================

import React from "react";
import { useTranslation } from "react-i18next";
import "@/pages/home/HomePage.css";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";

export default function LegalPage() {
  const { t } = useTranslation();

  return (
    <div className="landing legal-page">
      {/* ===== Top Bar ===== */}
      <TopBar />

      {/* ===== Hero ===== */}
      <section className="about-hero legal-hero">
        <div className="page-shell legal-hero-inner">
          <h1>{t("legal.title")}</h1>
          <p>{t("about.tagline")}</p>
        </div>
      </section>

      {/* ===== Legal Disclaimer ===== */}
      <section className="about-section">
        <div>
          <h2>{t("legal.disclaimerTitle")}</h2>
          <p>{t("legal.disclaimer")}</p>
        </div>
      </section>

      {/* ===== Privacy & Data ===== */}
      <section className="about-section">
        <div>
          <h2>{t("legal.privacyTitle")}</h2>
          <p>{t("legal.privacy")}</p>
        </div>
      </section>

      {/* ===== Safety ===== */}
      <section className="about-section">
        <div>
          <h2>{t("legal.safetyTitle")}</h2>
          <p>{t("legal.safety")}</p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <Footer />
    </div>
  );
}
