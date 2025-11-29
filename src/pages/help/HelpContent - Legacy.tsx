import React, { MutableRefObject, useMemo } from "react";
import { TFunction } from "i18next";
import { SectionKey } from "./types";
import { Card, FAQ, Kbd } from "./primitives";

import tigerTexture from "@/assets/styles/themes/optional/Tiger-skin-2.jpg";
import zebraTexture from "@/assets/styles/themes/optional/zebra-skin-1.png";
import cheetahTexture from "@/assets/styles/themes/optional/Cheetah-skin.jpg";

type QuickAction = { key: SectionKey; label: string };

type HelpContentProps = {
  t: TFunction<"translation", undefined>;
  sectionRefs: MutableRefObject<Record<SectionKey, HTMLElement | null>>;
  quickActions: QuickAction[];
  goTo: (key: SectionKey) => void;
  showFilterHint: boolean;
  query: string;
};

export function HelpContent({
  t,
  sectionRefs,
  quickActions,
  goTo,
  showFilterHint,
  query,
}: HelpContentProps) {
  const registerSectionRef = (key: SectionKey) => (el: HTMLElement | null) => {
    sectionRefs.current[key] = el;
  };

  const basicThemes = useMemo(
    () => [
      {
        key: "aurora",
        name: "Aurora (Default)",
        description:
          "Cool blues and vibrant greens with soft glassmorphism. This is the balanced everyday workspace.",
        variant: "gradient" as const,
      },
    ],
    []
  );

  const premiumThemes = useMemo(
    () => [
      {
        key: "tiger",
        name: "Tiger",
        description:
          "Molten amber gradients with bold striping. High contrast for focus sessions.",
        image: tigerTexture,
      },
      {
        key: "zebra",
        name: "Zebra",
        description:
          "Monochrome elegance brushed with soft gold. Perfect for a minimalist feel.",
        image: zebraTexture,
      },
      {
        key: "cheetah",
        name: "Cheetah",
        description:
          "Sunlit neutrals with subtle motion spots. Warm and friendly across desktop and mobile.",
        image: cheetahTexture,
      },
    ],
    []
  );

  return (
    <main className="help-content" tabIndex={0}>
      {/* Overview */}
      <section
        id="overview"
        data-section-key="overview"
        ref={registerSectionRef("overview")}
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
                <li>
                  {t(
                    "help.plans.free.li1",
                    "No registration required — use Aurora Light instantly."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.free.li2",
                    "Uploads and microphone are disabled until you sign in."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.free.li3",
                    "Great for quick questions with lightweight context."
                  )}
                </li>
              </ul>
            </div>
            <div className="help-plan help-plan-standard">
              <h4>{t("help.plans.standard.title", "Standard")}</h4>
              <div className="help-plan-badge">
                {t("help.plans.standard.badge", "Includes 7-day Aurora Plus trial")}
              </div>
              <ul>
                <li>
                  {t(
                    "help.plans.standard.li1",
                    "Starts with a 7-day Aurora Plus experience — priority models and tools."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.standard.li2",
                    "After the trial, keep Plus features with a daily token allowance."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.standard.li3",
                    "Ideal for personal learning and ongoing projects."
                  )}
                </li>
              </ul>
            </div>
            <div className="help-plan help-plan-plus">
              <h4>{t("help.plans.plus.title", "Plus")}</h4>
              <ul>
                <li>
                  {t(
                    "help.plans.plus.li1",
                    "Always-on premium compute with the latest Aurora brain."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.plus.li2",
                    "Workspace collaboration, share links, advanced exports, and automation."
                  )}
                </li>
                <li>
                  {t(
                    "help.plans.plus.li3",
                    "Early feature previews and dedicated email support."
                  )}
                </li>
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

      {/* Memory */}
      <section
        id="memory"
        data-section-key="memory"
        ref={registerSectionRef("memory")}
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

      {/* Modes */}
      <section
        id="modes"
        data-section-key="modes"
        ref={registerSectionRef("modes")}
        className="help-section"
      >
        <h2>{t("help.modes.title")}</h2>
        <Card>
          <p>{t("help.modes.description1")}</p>
          <p>{t("help.modes.description2")}</p>
        </Card>

        <div className="help-mode-grid">
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
        </div>
      </section>

      {/* Workspace */}
      <section
        id="workspace"
        data-section-key="workspace"
        ref={registerSectionRef("workspace")}
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

      {/* Themes */}
      <section
        id="themes"
        data-section-key="themes"
        ref={registerSectionRef("themes")}
        className="help-section"
      >
        <h2>Themes &amp; Skins</h2>
        <Card>
          <p>{t("help.themes.p1")}</p>
          <p>{t("help.themes.p2")}</p>
        </Card>

        <div className="help-theme-grid">
          {basicThemes.map((theme) => (
            <div key={theme.key} className="help-theme-card gradient">
              <div className="help-theme-preview gradient-preview" data-theme={theme.variant} />
              <div>
                <h4>{theme.name}</h4>
                <p>{theme.description}</p>
              </div>
            </div>
          ))}

          {premiumThemes.map((theme) => (
            <div key={theme.key} className="help-theme-card">
              <div className="help-theme-preview">
                <img src={theme.image} alt={`${theme.name} preview`} loading="lazy" />
              </div>
              <div>
                <h4>{theme.name}</h4>
                <p>{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section
        id="notes"
        data-section-key="notes"
        ref={registerSectionRef("notes")}
        className="help-section"
      >
        <h2>{t("help.notes.title")}</h2>
        <Card>
          <p>{t("help.notes.p1")}</p>
        </Card>

        <FAQ
          items={[
            {
              q: t("help.notes.faq1.q"),
              a: (
                <div>
                  <p>{t("help.notes.faq1.a1")}</p>
                  <p>{t("help.notes.faq1.a2")}</p>
                </div>
              ),
            },
            {
              q: t("help.notes.faq2.q"),
              a: (
                <div>
                  <p>{t("help.notes.faq2.a1")}</p>
                  <ul>
                    <li>{t("help.notes.faq2.a2")}</li>
                    <li>{t("help.notes.faq2.a3")}</li>
                    <li>{t("help.notes.faq2.a4")}</li>
                  </ul>
                </div>
              ),
            },
            {
              q: t("help.notes.faq3.q"),
              a: (
                <div>
                  <p>{t("help.notes.faq3.a1")}</p>
                  <p>{t("help.notes.faq3.a2")}</p>
                </div>
              ),
            },
          ]}
        />

        <section className="help-notes-pro">
          <h3>{t("help.notes.advancedTitle")}</h3>
          <FAQ
            items={[
              {
                q: t("help.notes.advTemplatesQ"),
                a: (
                  <div>
                    <p>{t("help.notes.advTemplatesA1")}</p>
                    <p>{t("help.notes.advTemplatesA2")}</p>
                  </div>
                ),
              },
              {
                q: t("help.notes.advExportQ"),
                a: (
                  <div>
                    <p>{t("help.notes.advExportA1")}</p>
                    <p>{t("help.notes.advExportA2")}</p>
                    <p>{t("help.notes.advExportA3")}</p>
                  </div>
                ),
              },
              {
                q: t("help.notes.advAutoQ"),
                a: (
                  <div>
                    <p>{t("help.notes.advAutoA1")}</p>
                    <p>{t("help.notes.advAutoA2")}</p>
                    <ul>
                      <li>{t("help.notes.advAutoA3")}</li>
                      <li>{t("help.notes.advAutoA4")}</li>
                      <li>{t("help.notes.advAutoA5")}</li>
                    </ul>
                  </div>
                ),
              },
              {
                q: t("help.notes.advCollaborateQ"),
                a: (
                  <div>
                    <p>{t("help.notes.advCollaborateA1")}</p>
                  </div>
                ),
              },
              {
                q: t("help.notes.advChecklistQ"),
                a: (
                  <div>
                    <p>{t("help.notes.advChecklistA1")}</p>
                    <p>{t("help.notes.advChecklistA2")}</p>
                    <p>{t("help.notes.advChecklistA3")}</p>
                  </div>
                ),
              },
            ]}
          />

          <Card title={t("help.notes.advancedGuides")}>
            <div className="help-notes-columns">
              <div>
                <h4>{t("help.notes.advSummariesTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advSummaries1")}</li>
                  <li>{t("help.notes.advSummaries2")}</li>
                  <li>{t("help.notes.advSummaries3")}</li>
                </ul>

                <h4>{t("help.notes.advTasksTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advTasks1")}</li>
                  <li>{t("help.notes.advTasks2")}</li>
                  <li>{t("help.notes.advTasks3")}</li>
                </ul>

                <h4>{t("help.notes.advDraftsTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advDrafts1")}</li>
                  <li>{t("help.notes.advDrafts2")}</li>
                </ul>
              </div>

              <div>
                <h4>{t("help.notes.advSaveTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advSave1")}</li>
                  <li>{t("help.notes.advSave2")}</li>
                  <li>{t("help.notes.advSave3")}</li>
                  <li>{t("help.notes.advSave4")}</li>
                </ul>

                <h4>{t("help.notes.advPinTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advPin1")}</li>
                </ul>

                <h4>{t("help.notes.advFindTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advFind1")}</li>
                  <li>{t("help.notes.advFind2")}</li>
                </ul>

                <h4>{t("help.notes.advLangTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advLang1")}</li>
                </ul>

                <h4>{t("help.notes.advCleanupTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advCleanup1")}</li>
                  <li>{t("help.notes.advCleanup2")}</li>
                  <li>{t("help.notes.advCleanup3")}</li>
                </ul>

                <h4>{t("help.notes.advNotifyTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advNotify1")}</li>
                </ul>

                <h4>{t("help.notes.advLongTermTitle")}</h4>
                <ul>
                  <li>{t("help.notes.advLongTerm1")}</li>
                  <li>{t("help.notes.advLongTerm2")}</li>
                </ul>
              </div>
            </div>
          </Card>
          </section>

        </section>

        {/* Internet */}
        <section
        id="internet"
        data-section-key="internet"
        ref={registerSectionRef("internet")}
        className="help-section"
      >
        <h2>{t("help.internet.title")}</h2>
        <Card>
          <p>{t("help.internet.p1")}</p>
          <p>{t("help.internet.p2")}</p>
          <p>{t("help.internet.listTitle")}</p>
          <ul>
            <li>{t("help.internet.li1")}</li>
            <li>{t("help.internet.li2")}</li>
            <li>{t("help.internet.li3")}</li>
          </ul>
          <p>{t("help.internet.p3")}</p>
        </Card>
      </section>

      {/* Attachments */}
      <section
        id="attachments"
        data-section-key="attachments"
        ref={registerSectionRef("attachments")}
        className="help-section"
      >
        <h2>{t("help.attachments.title")}</h2>
        <div className="help-grid">
          <Card>
            <p>{t("help.attachments.p1")}</p>
            <p>{t("help.attachments.p2")}</p>
          </Card>
          <Card title={t("help.attachments.what")} muted>
            <ul>
              <li>{t("help.attachments.li1")}</li>
              <li>{t("help.attachments.li2")}</li>
              <li>{t("help.attachments.li3")}</li>
            </ul>
          </Card>
        </div>
        <p className="help-highlight">{t("help.attachments.highlight")}</p>
      </section>

      {/* Disclaimer */}
      <section
        id="disclaimer"
        data-section-key="disclaimer"
        ref={registerSectionRef("disclaimer")}
        className="help-section"
      >
        <h2>{t("help.disclaimer.title")}</h2>
        <Card>
          <p>{t("help.disclaimer.p1")}</p>
          <p>{t("help.disclaimer.p2")}</p>
          <p className="help-highlight">{t("help.disclaimer.highlight")}</p>
        </Card>
      </section>

      {/* Privacy */}
      <section
        id="privacy"
        data-section-key="privacy"
        ref={registerSectionRef("privacy")}
        className="help-section"
      >
        <h2>{t("help.privacy.title")}</h2>
        <Card>
          <p>{t("help.privacy.p1")}</p>
          <p>{t("help.privacy.p2")}</p>
          <p className="help-highlight">{t("help.privacy.highlight")}</p>
        </Card>
      </section>

      {showFilterHint && (
        <div className="help-filter-hint">
          Showing results for <strong>{query}</strong>. Press <Kbd>Enter</Kbd> to jump within your
          browser find.
        </div>
      )}
    </main>
  );
}
