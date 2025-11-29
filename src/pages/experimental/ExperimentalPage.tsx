// ==============================================================================
// File: /frontend/src/pages/experimental/ExperimentalPage.tsx
// Description: Experimental playground that showcases the DroidGlobe with
//              tweakable locales + dialogue presets.
// ==============================================================================
import React, { useMemo, useState } from "react";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import DroidGlobe from "@/components/Droid/DroidGlobe";
import {
  DROID_GLOBE_PRESETS,
  DroidGlobePresetKey,
} from "@/components/Droid/presets";
import { STORYTELLER_PROMPTS } from "@/components/Droid/storyteller/behaviors";
import "./ExperimentalPage.css";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
];

export default function ExperimentalPage() {
  const [locale, setLocale] = useState("auto");
  const [presetKey, setPresetKey] = useState<DroidGlobePresetKey>("default");
  const [storyPromptIndex, setStoryPromptIndex] = useState(0);
  const [interactionClearKey, setInteractionClearKey] = useState(0);
  const initialLines = DROID_GLOBE_PRESETS.custom.languagePracticeLines.join("\n");
  const [customLines, setCustomLines] = useState(initialLines);
  const [appliedLines, setAppliedLines] = useState(
    DROID_GLOBE_PRESETS.default.languagePracticeLines
  );

  const activePreset = DROID_GLOBE_PRESETS[presetKey];

  const droidScript = useMemo(() => {
    if (presetKey === "custom") return undefined;
    return activePreset?.script;
  }, [presetKey, activePreset]);

  const languageLines = useMemo(() => {
    if (presetKey === "custom" || presetKey === "storyteller") {
      return appliedLines;
    }
    return activePreset?.languagePracticeLines;
  }, [presetKey, activePreset, appliedLines]);

  const handleApplyCustomLines = () => {
    const lines = customLines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length) {
      setAppliedLines(lines);
      setPresetKey("custom");
    }
  };

  const handlePresetChange = (key: DroidGlobePresetKey) => {
    setInteractionClearKey((current) => current + 1);
    if (key === "storyteller") {
      const prompt = STORYTELLER_PROMPTS[storyPromptIndex];
      const lines = prompt ? [prompt.line] : [];
      if (lines.length) {
        setAppliedLines(lines);
        setCustomLines(lines.join("\n"));
      }
      setStoryPromptIndex((current) => (current + 1) % STORYTELLER_PROMPTS.length);
      setPresetKey(key);
      return;
    }

    setPresetKey(key);
    if (key !== "custom") {
      const preset = DROID_GLOBE_PRESETS[key];
      setCustomLines(preset.languagePracticeLines.join("\n"));
      setAppliedLines(preset.languagePracticeLines);
    }
  };

  const resetToDefaultLines = () => {
    const fallbackLines = DROID_GLOBE_PRESETS.default.languagePracticeLines;
    setAppliedLines(fallbackLines);
    setCustomLines(fallbackLines.join("\n"));
    setPresetKey("default");
    setInteractionClearKey((current) => current + 1);
  };

  return (
    <div className="landing experimental-page">
      <TopBar />

      <main className="experimental-main">
        <section className="experimental-hero" data-droid-surface>
          <div className="experimental-copy">
            <p className="experimental-eyebrow">Aurora Lab</p>
            <h1>Experimental Playground</h1>
            <p className="experimental-lede">
              Tweak the Droid, change languages, and try unreleased ideas. This page
              moves fast—things may glow, shimmer, or gently break while we build.
            </p>

            <div className="experimental-controls">
              <div className="experimental-control">
                <label htmlFor="locale-select">Languages</label>
                <select
                  id="locale-select"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="experimental-control">
                <label>Persona Presets</label>
                <div className="preset-buttons">
                  {Object.entries(DROID_GLOBE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      className={`preset-button ${
                        key === presetKey ? "is-active" : ""
                      }`}
                      aria-pressed={key === presetKey}
                      onClick={() => handlePresetChange(key as DroidGlobePresetKey)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="experimental-control">
                <label htmlFor="custom-lines">Custom Prompt Lines</label>
                <textarea
                  id="custom-lines"
                  value={customLines}
                  onChange={(e) => setCustomLines(e.target.value)}
                  rows={6}
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="btn btn--primary btn--sm experimental-apply-btn"
                  onClick={handleApplyCustomLines}
                >
                  Apply Lines
                </button>
              </div>
            </div>
          </div>

          <div className="experimental-droid">
            <DroidGlobe
              locale={locale === "auto" ? undefined : locale}
              script={droidScript}
              languagePracticeLines={languageLines}
              onStoryPromptConsumed={resetToDefaultLines}
              interactionClearKey={interactionClearKey}
            />
          </div>
        </section>

        <section className="experimental-notes">
          <div className="experimental-note-card">
            <h2>What can you test here?</h2>
            <ul>
              <li>Teach the droid new expressions with custom lines.</li>
              <li>Preview multilingual personas before they land in the main app.</li>
              <li>Share feedback—this page ships experiments quickly.</li>
            </ul>
          </div>
          <div className="experimental-note-card">
            <h2>Coming soon</h2>
            <ul>
              <li>Camera-guided eye contact.</li>
              <li>Audio-reactive shaders.</li>
              <li>Exportable persona scripts.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
