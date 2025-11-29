// ==============================================================================
// File: /frontend/src/pages/HelpPage.tsx
// Description: Aurora Lumen Help page layout + navigation (content moved to help/HelpContent)
// ==============================================================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "./HelpPage.css";
import { useTranslation } from "react-i18next";

import { SECTIONS, SectionKey, ExtendedSectionKey } from "./types";
import { useIsMobile } from "./hooks";
import { Kbd } from "./primitives";
import { HelpContent } from "./HelpContent";
import "./HelpLayout.css";
import "./HelpElements.css";

export default function HelpPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<SectionKey>("memory");
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile(768);

  // ✅ Fully typed ref matching HelpContent (ExtendedSectionKey)
  const sectionRefs = useRef<Record<ExtendedSectionKey, HTMLElement | null>>({
    overview: null,
    memory: null,
    modes: null,
    workspace: null,
    themes: null,
    notes: null,
    internet: null,
    attachments: null,
    disclaimer: null,
    privacy: null,
    safety: null, // required for ExtendedSectionKey
  });

  useEffect(() => {
    if (isMobile) {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        /* no-op */
      }
    }
  }, [active, isMobile]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1
          );
        const id = visible[0]?.target.getAttribute("data-section-key") as
          | SectionKey
          | null;
        if (id && id !== active) {
          setActive(id);
        }
      },
      { root: null, threshold: 0.2 }
    );

    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el)
    );
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (key: SectionKey) => {
    setActive(key);
    const el = sectionRefs.current[key];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const quickActions = useMemo(
    () => [
      { key: "memory", label: t("help.menu.memory") },
      { key: "modes", label: t("help.menu.modes") },
      { key: "workspace", label: t("help.menu.workspace") },
      { key: "attachments", label: t("help.menu.attachments") },
    ],
    [t]
  ) as { key: SectionKey; label: string }[];

  const showFilterHint = query.trim().length > 0;

  return (
    <div className="landing help-page">
      <TopBar />

      <div className="help-header">
        <div>
          <h1>{t("help.title")}</h1>
          <p className="help-subtitle">{t("help.subtitle")}</p>
        </div>

        <div className="help-search-wrap">
          <input
            type="search"
            placeholder={t("help.search.placeholder") || "Search help..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help"
            className="help-search-input"
          />
          <span className="help-search-hint">
            <Kbd>Ctrl</Kbd> + <Kbd>F</Kbd>
          </span>
        </div>
      </div>

      {isMobile && (
        <div className="help-mobile-nav">
          <div className="help-mobile-tabs">
            {quickActions.map((q) => (
              <button
                key={q.key}
                onClick={() => goTo(q.key)}
                className={`help-tab${active === q.key ? " active" : ""}`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <label htmlFor="help-section-select" className="sr-only">
            Section
          </label>
          <select
            id="help-section-select"
            value={active}
            onChange={(e) => goTo(e.target.value as SectionKey)}
          >
            {SECTIONS.map((s) => (
              <option value={s.key} key={s.key}>
                {s.label.includes("help.menu.")
                  ? t(s.label)
                  : s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="help-layout">
        <aside className="help-sidebar">
          <nav>
            {SECTIONS.map((s) => {
              const label = s.label.includes("help.menu.")
                ? t(s.label)
                : s.label;
              return (
                <button
                  key={s.key}
                  onClick={() => goTo(s.key)}
                  className={`help-nav-btn ${
                    active === s.key ? "active" : ""
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <HelpContent
          t={t}
          sectionRefs={sectionRefs}
          quickActions={quickActions}
          goTo={goTo}
          showFilterHint={showFilterHint}
          query={query}
        />
      </div>

      <Footer />
    </div>
  );
}
