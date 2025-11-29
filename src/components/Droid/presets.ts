export type DroidGlobePresetKey = "default" | "custom" | "storyteller";

export const DROID_GLOBE_PRESETS: Record<
  DroidGlobePresetKey | string,
  { languagePracticeLines: string[]; script?: string[] }
> = {
  default: {
    languagePracticeLines: ["Hello from Aurora.", "Ask me anything."],
    script: ["Wave", "Greet"],
  },
  custom: {
    languagePracticeLines: ["Customize me!"],
  },
  storyteller: {
    languagePracticeLines: ["Once upon a time."],
    script: ["Story intro"],
  },
};
