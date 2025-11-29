// ==============================================================================
// File: /frontend/src/pages/home/HeroLaunchOrb.tsx
// Description: Animated launch orb that plays an energy pulse and opens the app.
// ==============================================================================
import React, { useCallback, useState } from "react";
import "./hero.launch-orb.css";

type HeroLaunchOrbProps = {
  label?: string;
  targetUrl?: string;
};

export default function HeroLaunchOrb({
  label = "Launch App",
  targetUrl = "/chat",
}: HeroLaunchOrbProps) {
  const [state, setState] = useState<"idle" | "charging">("idle");

  const handleClick = useCallback(() => {
    if (state === "charging") return;
    setState("charging");

    window.open(targetUrl, "_blank", "noopener,noreferrer");

    window.setTimeout(() => {
      setState("idle");
    }, 2200);
  }, [state, targetUrl]);

  return (
    <button
      type="button"
      className={`hero-launch-orb ${state}`}
      onClick={handleClick}
      aria-label={label}
    >
      <span className="hero-launch-label">{label}</span>
      <span className="hero-launch-subtext">Instant Aurora access</span>
      <span className="energy-layer layer-1" aria-hidden />
      <span className="energy-layer layer-2" aria-hidden />
      <span className="energy-core" aria-hidden />
    </button>
  );
}
