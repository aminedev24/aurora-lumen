// ==============================================================================
// File: /frontend/src/pages/help/HelpContentPart2.tsx
// Description: Aurora Lumen Help Page — Extended Sections (Themes, Notes, Internet, Attachments, Disclaimer)
// ==============================================================================

import React, { MutableRefObject, useMemo } from "react";
import { TFunction } from "i18next";
import { SectionKey } from "./types";
import { Card } from "./primitives";

import tigerTexture from "@/assets/styles/themes/optional/Tiger-skin-2.jpg";
import zebraTexture from "@/assets/styles/themes/optional/zebra-skin-1.png";
import cheetahTexture from "@/assets/styles/themes/optional/Cheetah-skin.jpg";

type HelpContentProps = {
  t: TFunction<"translation", undefined>;
  sectionRefs: MutableRefObject<Record<SectionKey, HTMLElement | null>>;
  quickActions: { key: SectionKey; label: string }[];
  goTo: (key: SectionKey) => void;
  showFilterHint: boolean;
  query: string;
};

export function HelpContentPart2({ t, sectionRefs }: HelpContentProps) {
  // ✅ Fixed: return type void to satisfy React.Ref signature
  const register = (key: SectionKey) => (el: HTMLElement | null): void => {
    sectionRefs.current[key] = el;
  };

  const premiumThemes = useMemo(
    () => [
      { key: "tiger", name: "Tiger", description: t("help.themes.tiger"), image: tigerTexture },
      { key: "zebra", name: "Zebra", description: t("help.themes.zebra"), image: zebraTexture },
      { key: "cheetah", name: "Cheetah", description: t("help.themes.cheetah"), image: cheetahTexture },
    ],
    [t]
  );

  return (
    <>
      {/* ===== Themes ===== */}
      <section
        id="themes"
        data-section-key="themes"
        ref={register("themes")}
        className="help-section"
      >
        <h2>Themes &amp; Skins</h2>
        <Card>
          <p>{t("help.themes.p1")}</p>
          <p>{t("help.themes.p2")}</p>
        </Card>

        <div className="theme-gallery">
          {premiumThemes.map((theme) => (
            <div key={theme.key} className="theme-card">
              <div className="theme-preview">
                <img src={theme.image} alt={theme.name} />
              </div>
              <h4>{theme.name}</h4>
              <p>{theme.description}</p>
            </div>
          ))}
        </div>
      </section>

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
      </section>

      {/* ===== Internet ===== */}
      <section
        id="internet"
        data-section-key="internet"
        ref={register("internet")}
        className="help-section"
      >
        <h2>{t("help.internet.title")}</h2>
        <Card>
          <p>{t("help.internet.p1")}</p>
          <p>{t("help.internet.p2")}</p>
          <ul>
            <li>{t("help.internet.li1")}</li>
            <li>{t("help.internet.li2")}</li>
            <li>{t("help.internet.li3")}</li>
          </ul>
        </Card>
      </section>

      {/* ===== Attachments ===== */}
      <section
        id="attachments"
        data-section-key="attachments"
        ref={register("attachments")}
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
      </section>

      {/* ===== Disclaimer ===== */}
      <section
        id="disclaimer"
        data-section-key="disclaimer"
        ref={register("disclaimer")}
        className="help-section"
      >
        <h2>{t("help.disclaimer.title")}</h2>
        <Card>
          <p>{t("help.disclaimer.p1")}</p>
        </Card>
      </section>
    </>
  );
}
