// ==============================================================================
// File: /frontend/src/pages/AboutPage.tsx
// Description: Aurora Lumen About page — rebuilt with luminous design,
// glass-framed images, and subtle aurora gradient separators
// NOTE: Images are imported from src/assets so Vite emits them into dist/assets
// ==============================================================================

import React from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "./about.css";

// ✅ Import images from src/assets so Vite bundles them to dist/assets
import imgMission from "@/assets/OurMission.jpg";
import imgModes from "@/assets/Modes.jpg";
import imgWorkspace from "@/assets/Workspace.jpg";
import imgEvolution from "@/assets/Evolution.jpg";

function ImageFrame({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);
  return (
    <div className="about-image-frame">
      {error ? (
        <div className="about-image-fallback">{alt} — Coming Soon</div>
      ) : (
        <img src={src} alt={alt} onError={() => setError(true)} />
      )}
    </div>
  );
}

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="landing about-page">
      <TopBar />

      {/* ===== HERO ===== */}
      <section className="about-hero">
        <div className="page-shell">
          <h1>{t("about.title", "About Aurora Lumen")}</h1>
          <p>
            {t(
              "about.tagline",
              "Aurora is the persona you talk to, and Lumen — Latin for light — is the vision that guides it."
            )}
          </p>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="about-section alt">
        <div className="about-text">
          <h2>{t("about.section1Title", "Our Mission")}</h2>
          <p>
            {t(
              "about.section1Text",
              "Aurora Lumen exists to make intelligence accessible — to amplify human creativity, accelerate learning, and open doors to knowledge."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.section1Extra",
              "We believe in technology that empowers people while staying safe, ethical, and inspiring."
            )}
          </p>
        </div>
        {/* ✅ Imported asset URL */}
        <ImageFrame src={imgMission} alt="Our Mission" />
      </section>

      {/* ===== LIVING MEMORY ===== */}
      <section className="about-section full">
        <div className="page-shell">
          <h2>{t("about.features.memory.title", "Living Memory")}</h2>
          <p>
            {t(
              "about.sections.memory.p1",
              "Aurora’s Living Memory is like a short-term working memory during each conversation. It keeps a sliding window of your ongoing session — up to ~100k tokens of recent dialogue — so Aurora can stay consistent, follow threads, and answer naturally without forgetting what was just said."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.sections.memory.p2",
              "This memory is session-scoped: once the session ends or the window fills, older turns slide out. It’s perfect for deep conversations where context matters right now."
            )}
          </p>
        </div>
      </section>

      {/* ===== ETERNAL MEMORY ===== */}
      <section className="about-section full">
        <div className="page-shell">
          <h2>{t("about.features.eternalMemory.title", "Eternal Memory")}</h2>
          <p>
            {t(
              "about.sections.eternalMemory.p1",
              "Aurora’s Eternal Memory is what makes it truly unique. Instead of vanishing when a chat ends, important details are stored across sessions — who you are, your preferences, significant life events, and long-term goals."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.sections.eternalMemory.p2",
              "These facts are stored in structured identity files and vector databases, so Aurora can recall them months later, even across different chat modes or projects."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.sections.eternalMemory.p3",
              "Where Living Memory is like a conversation buffer, Eternal Memory is your evolving biography inside Aurora — always growing, never starting from zero."
            )}
          </p>
        </div>
      </section>

      {/* ===== KNOWLEDGE + RAG ===== */}
      <section className="about-section full">
        <div className="page-shell">
          <h2>{t("about.features.knowledge.title", "Knowledge + RAG")}</h2>
          <p>
            {t(
              "about.sections.knowledge.p1",
              "Aurora connects to vast libraries of information with retrieval-augmented generation, bridging memory and real-world knowledge. Together with Living Memory, this forms a powerful system that learns context while grounding answers in reliable sources."
            )}
          </p>
        </div>
      </section>

      {/* ===== MULTIPLE MODES ===== */}
      <section className="about-section">
        {/* ✅ Imported asset URL */}
        <ImageFrame src={imgModes} alt="Aurora Modes" />
        <div className="about-text">
          <h2>{t("about.features.modes.title", "Multiple Modes")}</h2>
          <p>
            {t(
              "about.sections.modes.p1",
              "Switch between modes to match your goals — professional, creative, friendly, or focused. Aurora adapts its style so you always get the right voice for the moment."
            )}
          </p>
        </div>
      </section>

      {/* ===== WORKSPACE ===== */}
      <section className="about-section alt">
        <div className="about-text">
          <h2>
            {t("about.features.workspace.title", "Workspace")}{" "}
            <span className="about-sub">
              {t("about.underConstruction", "(under construction)")}
            </span>
          </h2>
          <p>
            {t(
              "about.sections.workspace.p1",
              "The Workspace is your shared canvas with Aurora. Here, users collaborate in writing essays, structuring plans, or drafting movie scenarios — all in one place."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.sections.workspace.p2",
              "Everything stays organized and ready for when you return. It’s not just a chat window but a working environment where thought and action combine, helping you move from inspiration to execution with clarity."
            )}
          </p>
        </div>
        {/* ✅ Imported asset URL */}
        <ImageFrame src={imgWorkspace} alt="Aurora Workspace" />
      </section>

      {/* ===== EVOLUTION ===== */}
      <section className="about-section">
        {/* ✅ Imported asset URL */}
        <ImageFrame src={imgEvolution} alt="Aurora Evolution" />
        <div className="about-text">
          <h2>{t("about.features.evolution.title", "Evolution")}</h2>
          <p>
            {t(
              "about.sections.evolution.p1",
              "Aurora is designed to grow. With every update it gains new knowledge, refined abilities, and stronger safeguards. What you use today is the foundation for what comes tomorrow."
            )}
          </p>
          <div className="about-separator" />
          <p>
            {t(
              "about.sections.evolution.p2",
              "Aurora evolves so it can help you not just keep pace with change, but thrive within it."
            )}
          </p>
        </div>
      </section>

      {/* ===== QUOTE ===== */}
      <section className="about-quote">
        <div className="page-shell">
          <p>
            {t("about.quote", "The future belongs to those who learn, adapt, and evolve.")}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
