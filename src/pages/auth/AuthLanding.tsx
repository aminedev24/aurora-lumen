// ==============================================================================
// File: /frontend/src/pages/AuthLanding.tsx
// Description: Aurora Lumen split-screen landing for login/register
// - Top half: Aurora Green background, rotating sample prompts
// - Bottom half: Black background with Log in / Sign up buttons
// - Buttons now link to /login?mode=login or /login?mode=register
// ==============================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/pages/TopBar";
import "./AuthLanding.css";

export default function AuthLanding() {
  const navigate = useNavigate();

  return (
    <div className="auth-landing-shell">
      <TopBar />

      <section className="auth-landing-hero">
        <div className="auth-landing-hero-inner">
          <p className="auth-landing-eyebrow">Personal AI workspace</p>
          <h1>Keep every plan, ritual, and recap in one trusted place.</h1>
          <p className="auth-landing-lede">
            Aurora Lumen remembers what you share, switches personas on the fly, and brings your notes,
            journeys, and experiments back whenever you need them.
          </p>
          <ul className="auth-landing-list">
            <li>Remember research summaries, workouts, and travel briefs automatically.</li>
            <li>Jump between coder, writer, or debate personas without losing context.</li>
            <li>Launch from desktop or phone—your workspace syncs instantly.</li>
          </ul>
          <div className="auth-landing-hero-actions">
            <button onClick={() => navigate("/login?mode=login")} className="btn btn--primary btn--sm">
              Sign in
            </button>
            <button onClick={() => navigate("/login?mode=register")} className="btn btn--outline btn--sm">
              Create an account
            </button>
          </div>
        </div>
      </section>

      <section className="auth-landing-bottom">
        <h2>Get started</h2>
        <div className="auth-landing-actions">
          <button
            onClick={() => navigate("/login?mode=login")}
            className="btn btn--outline btn--sm auth-landing-btn"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/login?mode=register")}
            className="btn btn--primary btn--sm auth-landing-btn"
          >
            Sign up for free
          </button>
        </div>
        <p className="auth-landing-footnote">Try it first</p>
      </section>

    </div>
  );
}

