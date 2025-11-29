// ==============================================================================
// File: /frontend/src/pages/help/HelpContent.tsx
// Description: Orchestrator for Help Page sections (Core + Plus modules)
// ==============================================================================

import React from "react";
import type { TFunction } from "i18next";
import type { MutableRefObject } from "react";
import type { SectionKey, ExtendedSectionKey } from "./types";

import { HelpContentPart1 } from "./HelpContentPart1";
import { HelpContentPart2 } from "./HelpContentPart2";
import { HelpContentPart3 } from "./HelpContentPart3";

type HelpContentProps = {
  t: TFunction<"translation", undefined>;
  sectionRefs: MutableRefObject<Record<ExtendedSectionKey, HTMLElement | null>>;
  quickActions: { key: SectionKey; label: string }[];
  goTo: (key: SectionKey) => void;
  showFilterHint: boolean;
  query: string;
};

export function HelpContent(props: HelpContentProps) {
  return (
    <main className="help-content" tabIndex={0}>
      <HelpContentPart1 {...props} />
      <HelpContentPart2 {...props} />
      <HelpContentPart3 {...props} />
    </main>
  );
}
