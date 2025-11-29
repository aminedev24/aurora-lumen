// ==============================================================================
// File: /frontend/src/pages/help/types.ts
// Description: Shared type definitions for Aurora Lumen Help page
// ==============================================================================

// All core help page sections
export type SectionKey =
  | "overview"
  | "memory"
  | "modes"
  | "workspace"
  | "themes"
  | "notes"
  | "internet"
  | "attachments"
  | "disclaimer"
  | "privacy";

// Extended key set (adds safety section for HelpContentPart3)
export type ExtendedSectionKey = SectionKey | "safety";

// Section descriptor used for navigation / SECTIONS constant
export interface SectionItem {
  key: SectionKey;
  label: string;
}

// List of all sections used for sidebar and dropdown navigation
export const SECTIONS: SectionItem[] = [
  { key: "overview", label: "help.menu.overview" },
  { key: "memory", label: "help.menu.memory" },
  { key: "modes", label: "help.menu.modes" },
  { key: "workspace", label: "help.menu.workspace" },
  { key: "themes", label: "help.menu.themes" },
  { key: "notes", label: "help.menu.notes" },
  { key: "internet", label: "help.menu.internet" },
  { key: "attachments", label: "help.menu.attachments" },
  { key: "disclaimer", label: "help.menu.disclaimer" },
  { key: "privacy", label: "help.menu.privacy" },
];
