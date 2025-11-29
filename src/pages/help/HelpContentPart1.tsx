// ==============================================================================
// File: /frontend/src/pages/help/HelpContentPart1.tsx
// Description: Aurora Lumen Help Page — Core Sections (Overview, Memory, Modes, Workspace)
// ==============================================================================

import React, { MutableRefObject } from "react";
import { TFunction } from "i18next";
import { SectionKey } from "./types";
import { Card, FAQ } from "./primitives";

type HelpContentProps = {
  t: TFunction<"translation", undefined>;
  sectionRefs: MutableRefObject<Record<SectionKey, HTMLElement | null>>;
  quickActions: { key: SectionKey; label: string }[];
  goTo: (key: SectionKey) => void;
  showFilterHint: boolean;
  query: string;
};

export function HelpContentPart1({
  t,
  sectionRefs,
  quickActions,
  goTo,
}: HelpContentProps) {
  // ✅ fixed: explicit void return for React.Ref compliance
  const register = (key: SectionKey) => (el: HTMLElement | null): void => {
    sectionRefs.current[key] = el;
  };

  return (
    <>
      {/* ===== Overview ===== */}
      <section
        id="overview"
        data-section-key="overview"
        ref={register("overview")}
        className="help-section"
      >
        <h2>{t("help.overview.title")}</h2>
        <Card>
          <p>{t("help.overview.p1")}</p>
          <p>{t("help.overview.p2")}</p>
        </Card>

        <Card title={t("help.plans.title", "Compare Aurora plans")}>
          <p>
            {t(
              "help.plans.subtitle",
              "Aurora offers three account levels. Upgrade or downgrade anytime inside your web account."
            )}
          </p>
          <div className="help-plan-grid">
            <div className="help-plan help-plan-free">
              <h4>{t("help.plans.free.title", "Free (guest)")}</h4>
              <ul>
                <li>{t("help.plans.free.li1")}</li>
                <li>{t("help.plans.free.li2")}</li>
                <li>{t("help.plans.free.li3")}</li>
              </ul>
            </div>

            <div className="help-plan help-plan-standard">
              <h4>{t("help.plans.standard.title", "Standard")}</h4>
              <div className="help-plan-badge">
                {t("help.plans.standard.badge", "Includes 7-day Aurora Plus trial")}
              </div>
              <ul>
                <li>{t("help.plans.standard.li1")}</li>
                <li>{t("help.plans.standard.li2")}</li>
                <li>{t("help.plans.standard.li3")}</li>
              </ul>
            </div>

            <div className="help-plan help-plan-plus">
              <h4>{t("help.plans.plus.title", "Plus")}</h4>
              <ul>
                <li>{t("help.plans.plus.li1")}</li>
                <li>{t("help.plans.plus.li2")}</li>
                <li>{t("help.plans.plus.li3")}</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="help-quick-actions">
          {quickActions.map((q) => (
            <button key={q.key} className="quick-action" onClick={() => goTo(q.key)}>
              {q.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== Memory ===== */}
      <section
        id="memory"
        data-section-key="memory"
        ref={register("memory")}
        className="help-section"
      >
        <h2>{t("help.memory.title")}</h2>
        <Card>
          <p>{t("help.memory.p1")}</p>
        </Card>

        <div className="help-grid">
          <Card title={t("help.memory.shortTitle")}>
            <p>{t("help.memory.short1")}</p>
            <p>{t("help.memory.short2")}</p>
          </Card>
          <Card title={t("help.memory.longTitle")}>
            <p>{t("help.memory.long1")}</p>
            <p>{t("help.memory.long2")}</p>
            <p>{t("help.memory.long3")}</p>
          </Card>
        </div>

        <FAQ
          items={[
            { q: t("help.memory.faq1.q"), a: t("help.memory.faq1.a") },
            { q: t("help.memory.faq2.q"), a: t("help.memory.faq2.a") },
            { q: t("help.memory.faq3.q"), a: t("help.memory.faq3.a") },
          ]}
        />
      </section>

      {/* ===== Modes ===== */}
      <section
        id="modes"
        data-section-key="modes"
        ref={register("modes")}
        className="help-section"
      >
        <h2>{t("help.modes.title")}</h2>
        <Card>
          <p>{t("help.modes.description1")}</p>
          <p>{t("help.modes.description2")}</p>
        </Card>

        <div className="help-grid">
          <Card title={t("help.modes.aurora.title")}>
            <p>{t("help.modes.aurora.body1")}</p>
            <p>{t("help.modes.aurora.body2")}</p>
          </Card>
          <Card title={t("help.modes.lumen.title")}>
            <p>{t("help.modes.lumen.body1")}</p>
            <p>{t("help.modes.lumen.body2")}</p>
          </Card>
          <Card title={t("help.modes.focus.title")}>
            <p>{t("help.modes.focus.body1")}</p>
            <p>{t("help.modes.focus.body2")}</p>
          </Card>
          <Card title={t("help.modes.play.title")}>
            <p>{t("help.modes.play.body1")}</p>
            <p>{t("help.modes.play.body2")}</p>
          </Card>
          <Card title={t("help.modes.vibes.title", "Aurora vibes & moods")}>
            <p>
              {t(
                "help.modes.vibes.body1",
                "When you’re in Aurora or any custom persona, you can ask for a vibe boost—try phrases like “send me a vibe”, “motivate me”, or “I feel lazy” to trigger the animated gratitude/heart/motivation overlays in the chat window."
              )}
            </p>
            <p>
              {t(
                "help.modes.vibes.body2",
                "It’s visual only (no audio) and respects your theme, so feel free to hype yourself up whenever you need inspiration."
              )}
            </p>
          </Card>
        </div>
      </section>

      {/* ===== Workspace ===== */}
      <section
        id="workspace"
        data-section-key="workspace"
        ref={register("workspace")}
        className="help-section"
      >
        <h2>{t("help.workspace.title")}</h2>
        <Card>
          <p>{t("help.workspace.p1")}</p>
          <p>{t("help.workspace.p2")}</p>
        </Card>

        <div className="help-grid">
          <Card title={t("help.workspace.projectsTitle")}>
            <ul>
              <li>{t("help.workspace.projects1")}</li>
              <li>{t("help.workspace.projects2")}</li>
              <li>{t("help.workspace.projects3")}</li>
            </ul>
          </Card>
          <Card title={t("help.workspace.sharingTitle")}>
            <ul>
              <li>{t("help.workspace.sharing1")}</li>
              <li>{t("help.workspace.sharing2")}</li>
              <li>{t("help.workspace.sharing3")}</li>
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
