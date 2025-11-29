// ==============================================================================
// File: /frontend/src/pages/Footer.tsx
// Description: Aurora Lumen Unified Footer (Full-width Aurora gradient background)
// Notes:
// - Uses .aurora-footer styles defined in home.sections.css
// - Content stays centered with max-width shell
// - Brand logo/wordmark is now clickable (links to "/").
// ==============================================================================

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuroraWordmark } from "@/components/Brand/AuroraLogo";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="aurora-footer">
      <div className="footer-shell">
        {/* Brand (clickable → home) */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-brand-link"
            aria-label={t("brand.name", "Aurora Lumen")}
          >
            <AuroraWordmark
              size={44}
              strokeWidth={3}
              text={t("brand.name", "Aurora Lumen")}
              textAs="h3"
              textClassName="footer-brand-text"
            />
          </Link>
        </div>

        {/* Links */}
        <ul className="footer-links">
          <li>
            <Link to="/about">{t("footer.about", "About")}</Link>
          </li>
          <li>
            <Link to="/chat">{t("footer.auroraChat", "Aurora Chat")}</Link>
          </li>
          <li>
            <Link to="/help">{t("nav.help", "Help")}</Link>
          </li>
          <li>
            <Link to="/legal">{t("footer.legalSafety", "Legal & Safety")}</Link>
          </li>
          <li>
            <Link to="/contact">{t("footer.contact", "Contact")}</Link>
          </li>
        </ul>

        {/* Copyright */}
        <p className="footer-copy">
          {t("footer.copyright", {
            year: new Date().getFullYear(),
            defaultValue: `© ${new Date().getFullYear()} Aurora Lumen. All rights reserved.`,
          })}
        </p>
      </div>
    </footer>
  );
}
