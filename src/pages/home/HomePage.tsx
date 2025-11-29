// ==============================================================================
// File: /frontend/src/pages/HomePage.tsx
// Description: Aurora Lumen Landing Page — interactive video left, text right,
// floating droid with multilingual greetings and restricted movement within hero
// ==============================================================================

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import {
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  Play,
  Shield,
} from "lucide-react";
import "@/pages/home/HomePage.css";
import HeroLaunchOrb from "@/pages/home/HeroLaunchOrb";
import { useWebAuth } from "@/lib/webAuth";
import heroVideo from "@/assets/aurora-speaks.mp4";


const THEME_KEY = "aurora_theme";

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useWebAuth();

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" &&
    localStorage.getItem(THEME_KEY) === "dark"
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.9);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // add this near your other consts
const HERO_VIDEO_SRC = new URL("/aurora-speaks.mp4", window.location.origin).toString();

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Apply mute/volume changes to the element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
    v.volume = Math.min(1, Math.max(0, volume));
  }, [isMuted, volume]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay blocked; keep state consistent
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(!v.paused);
    }
  }, []);


  // ---------------- THEME TOGGLE ----------------
  useEffect(() => {
    const body = document.body;
    if (!body) return;
    if (isDark) {
      body.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      body.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [isDark]);

  // ---------------- THEME BUTTON ----------------
  const themeToggle = useMemo(
    () => (
      <button
        className="hp-theme-toggle"
        aria-label={
          isDark
            ? t("common.light", "Switch to light mode")
            : t("common.dark", "Switch to dark mode")
        }
        onClick={() => setIsDark((v) => !v)}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    ),
    [isDark, t]
  );

  const primaryCtaHref = isAuthenticated ? "/account" : "/login";
  const primaryCtaLabel = isAuthenticated
    ? t("home.cta.primaryAuthenticated", "Open your account")
    : t("home.cta.primary", "Start free");
  const showTrialLabel = !isAuthenticated;
  const canLaunchChat = isAuthenticated;

  // ---------------- PAGE RENDER ----------------
  return (
    <div className="landing home-v2">
      <TopBar extraActions={themeToggle} />

      {/* ---------- HERO ---------- */}
      <header className="hp-hero">
      <div className="hp-shell hp-hero-shell">
        <div className="hp-hero-copy">
          <div className="hp-eyebrow">
            {t("home.eyebrow", "Introducing Aurora Lumen")}
          </div>
          <h1 className="hp-title">
            {t(
              "home.title",
              "Your AI companion that inspires, teaches, and evolves with you"
            )}
          </h1>
            <p className="hp-subtitle">
              {t(
                "home.subtitle",
                "Aurora helps you learn, create, and grow — from science to art to everyday life."
              )}
            </p>

            <div className="hp-cta-row">
              <Link
                to={primaryCtaHref}
                className="btn btn--primary hp-btn hp-btn--stacked"
              >
                <span className="hp-btn-main">
                  {primaryCtaLabel} <ArrowRight size={18} />
                </span>
                {showTrialLabel ? (
                  <span className="hp-btn-label">
                    {t("home.cta.trialLabel", "7 Days Free Trial")}
                  </span>
                ) : null}
              </Link>
              <a href="#demo" className="btn btn--ghost hp-btn">
                <Play size={18} />{" "}
                {t("home.cta.secondary", "Watch quick demo")}
              </a>
              {canLaunchChat && (
                <Link to="/chat" className="btn btn--outline hp-btn">
                  {t("home.cta.launch", "Launch Aurora App")} <ArrowRight size={18} />
                </Link>
              )}
            </div>

            <div className="hp-guarantee">
              <Shield size={16} />{" "}
              {t("home.guarantee", "Private by default · You own your data")}
            </div>
            
            {/* Invest in Aurora Lumen - moved up */}
            <div className="hp-invest-link">
              <Link to="/support" className="hp-inline-link">
                Invest in Aurora Lumen
                <ArrowRight size={14} className="hp-inline-icon" />
              </Link>
            </div>
        </div>

        <div className="hp-hero-orb">
          <HeroLaunchOrb />
        </div>
      </div>

      {/* ---------- LOGOS ---------- */}
      <div className="hp-logos">
        <div className="hp-shell">
          <span>
            {t("home.logos.title", "Trusted by creators and dreamers")}
            </span>
          </div>
        </div>
      </header>

      {/* ---------- FEATURES ---------- */}
      <section className="hp-block hp-features" id="features">
        <div className="hp-shell">
          <div className="hp-grid">
            <div className="hp-card">
              <h3>{t("home.f1.title", "Living Memory")}</h3>
              <p>
                {t(
                  "home.f1.desc",
                  "Aurora remembers what matters — your goals, notes, and reflections."
                )}
              </p>
            </div>
            <div className="hp-card">
              <h3>{t("home.f2.title", "Reasoning & Creativity")}</h3>
              <p>
                {t(
                  "home.f2.desc",
                  "From planning to art to self-growth — Aurora learns your rhythm."
                )}
              </p>
            </div>
            <div className="hp-card">
              <h3>{t("home.f3.title", "Personal Modes")}</h3>
              <p>
                {t(
                  "home.f3.desc",
                  "Switch instantly between learner, creator, traveler, or dreamer."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- DEMO SECTION ---------- */}
<section className="hp-block hp-split" id="demo">
  <div className="hp-shell hp-demo-flex">
    <div className={`hp-video-wrap ${isExpanded ? "expanded" : ""}`}>
      <video
        ref={videoRef}
        className="hp-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: "100%", height: "auto", borderRadius: 12 }}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnded}
        onError={() => setVideoError("Video failed to load.")}
      >
        <source src={heroVideo} type="video/mp4" />

        Your browser does not support the video tag.
      </video>

      {videoError && (
        <div style={{ marginTop: 8, fontSize: "0.9rem", opacity: 0.8 }}>
          {videoError}
        </div>
      )}

      <div className="hp-cta-row" style={{ marginTop: 10 }}>
        <button
          className="hp-btn hp-btn--primary"
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            if (v.paused) v.play().catch(() => {});
            else v.pause();
          }}
        >
          {isPlaying ? t("home.video.pause", "Pause") : t("home.video.play", "Play")}
        </button>

        <button
          className="hp-btn hp-btn--ghost"
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            v.muted = !v.muted;
            setIsMuted(v.muted);
          }}
        >
          {isMuted ? t("home.video.unmute", "Unmute") : t("home.video.mute", "Mute")}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            const newVol = Number(e.target.value);
            setVolume(newVol);
            if (videoRef.current) videoRef.current.volume = newVol;
          }}
          style={{ width: 140 }}
          aria-label={t("home.video.volume", "Volume")}
        />
      </div>

      <button
        className="hp-video-toggle"
        onClick={() => setIsExpanded((v) => !v)}
      >
        {isExpanded
          ? t("home.video.minimize", "Shrink Video")
          : t("home.video.expand", "Expand Video")}
      </button>
    </div>

    <div className="hp-split-copy">
      <h2>
        {t("home.split.title","From curiosity to creation — all within one chat")}
      </h2>
      <ul className="hp-list">
        <li><CheckCircle2 size={18} /> {t("home.split.li1","Ask follow-ups — Aurora remembers context.")}</li>
        <li><CheckCircle2 size={18} /> {t("home.split.li2","Turn ideas into clear steps or summaries.")}</li>
        <li><CheckCircle2 size={18} /> {t("home.split.li3","Export or share easily when you're ready.")}</li>
      </ul>
      <Link to="/about" className="hp-inline-link">
        {t("home.split.learn","See how it works")}
        <ArrowRight size={14} className="hp-inline-icon" />
      </Link>
    </div>
  </div>
</section>



      {/* ---------- FINAL CTA ---------- */}
      <section className="hp-block hp-final">
        <div className="hp-shell">
          <h2>{t("home.final.title", "Ready when you are")}</h2>
          <p className="hp-final-sub">
            {t(
              "home.final.sub",
              "Create your own Aurora companion and begin your journey today."
            )}
          </p>
          <div className="hp-cta-row">
            <Link
              to={isAuthenticated ? "/chat" : "/login"}
              className="hp-btn hp-btn--primary"
            >
              {isAuthenticated
                ? t("home.final.launchApp", "Launch the App")
                : t("home.final.cta", "Create free account")}{" "}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

