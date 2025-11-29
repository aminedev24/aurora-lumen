// ==============================================================================
// File: /frontend/src/pages/help/HelpContentPart3.tsx
// Description: Aurora Lumen Help Page — Advanced Notes + In-Depth FAQ Sections
// ==============================================================================

import React, { MutableRefObject } from "react";
import { TFunction } from "i18next";
import { SectionKey } from "./types";
import { Card, FAQ } from "./primitives";

type ExtendedSectionKey = SectionKey | "safety"; // ✅ added type union for safety section

type HelpContentProps = {
  t: TFunction<"translation", undefined>;
  sectionRefs: MutableRefObject<Record<ExtendedSectionKey, HTMLElement | null>>;
  quickActions: { key: SectionKey; label: string }[];
  goTo: (key: SectionKey) => void;
  showFilterHint: boolean;
  query: string;
};

export function HelpContentPart3({ t, sectionRefs }: HelpContentProps) {
  // ✅ Fixed ref callback type and added explicit void return
  const register = (key: ExtendedSectionKey) => (el: HTMLElement | null): void => {
    sectionRefs.current[key] = el;
  };

  return (
    <>
      {/* ===== Notes ===== */}
      <section
        id="notes"
        data-section-key="notes"
        ref={register("notes")}
        className="help-section"
      >
        <h2>{t("help.notes.title")}</h2>
        <Card>
          <p>{t("help.notes.p1")}</p>
        </Card>

        {/* --- Basic Notes FAQ --- */}
        <FAQ
          items={[
            {
              q: t("help.notes.faq1.q"),
              a: (
                <>
                  <p>{t("help.notes.faq1.a1")}</p>
                  <p>{t("help.notes.faq1.a2")}</p>
                </>
              ),
            },
            {
              q: t("help.notes.faq2.q"),
              a: (
                <>
                  <p>{t("help.notes.faq2.a1")}</p>
                  <ul>
                    <li>{t("help.notes.faq2.a2")}</li>
                    <li>{t("help.notes.faq2.a3")}</li>
                    <li>{t("help.notes.faq2.a4")}</li>
                  </ul>
                </>
              ),
            },
            {
              q: t("help.notes.faq3.q"),
              a: (
                <>
                  <p>{t("help.notes.faq3.a1")}</p>
                  <p>{t("help.notes.faq3.a2")}</p>
                </>
              ),
            },
          ]}
        />

        {/* --- Advanced Notes --- */}
        <section className="help-notes-pro">
          <h3>{t("help.notes.advancedTitle")}</h3>

          <FAQ
            items={[
              {
                q: t("help.notes.advTemplatesQ"),
                a: (
                  <>
                    <p>{t("help.notes.advTemplatesA1")}</p>
                    <p>{t("help.notes.advTemplatesA2")}</p>
                  </>
                ),
              },
              {
                q: t("help.notes.advExportQ"),
                a: (
                  <>
                    <p>{t("help.notes.advExportA1")}</p>
                    <p>{t("help.notes.advExportA2")}</p>
                    <p>{t("help.notes.advExportA3")}</p>
                  </>
                ),
              },
              {
                q: t("help.notes.advAutoQ"),
                a: (
                  <>
                    <p>{t("help.notes.advAutoA1")}</p>
                    <p>{t("help.notes.advAutoA2")}</p>
                    <ul>
                      <li>{t("help.notes.advAutoA3")}</li>
                      <li>{t("help.notes.advAutoA4")}</li>
                      <li>{t("help.notes.advAutoA5")}</li>
                    </ul>
                  </>
                ),
              },
              {
                q: t("help.notes.advCollaborateQ"),
                a: <p>{t("help.notes.advCollaborateA1")}</p>,
              },
              {
                q: t("help.notes.advChecklistQ"),
                a: (
                  <>
                    <p>{t("help.notes.advChecklistA1")}</p>
                    <p>{t("help.notes.advChecklistA2")}</p>
                    <p>{t("help.notes.advChecklistA3")}</p>
                  </>
                ),
              },
            ]}
          />

          {/* --- Advanced Guides --- */}
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

      {/* ===== Privacy ===== */}
      <section
        id="privacy"
        data-section-key="privacy"
        ref={register("privacy")}
        className="help-section"
      >
        <h2>{t("help.privacy.title")}</h2>
        <Card>
          <p>{t("help.privacy.p1")}</p>
          <p>{t("help.privacy.p2")}</p>
        </Card>
        <FAQ
          items={[
            { q: t("help.privacy.faq1.q"), a: t("help.privacy.faq1.a") },
            { q: t("help.privacy.faq2.q"), a: t("help.privacy.faq2.a") },
          ]}
        />
      </section>

      {/* ===== Safety ===== */}
      <section
        id="safety"
        data-section-key="safety"
        ref={register("safety")} // ✅ no longer type error — included in ExtendedSectionKey
        className="help-section"
      >
        <h2>{t("help.safety.title")}</h2>
        <Card>
          <p>{t("help.safety.p1")}</p>
          <p>{t("help.safety.p2")}</p>
        </Card>
      </section>
    </>
  );
}
