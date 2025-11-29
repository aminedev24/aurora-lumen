// ==============================================================================
// File: /frontend/src/pages/LanguageSwitcher.tsx
// ==============================================================================

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { setPreferredLanguage } from "@/i18n";

const LANG_OPTIONS = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "es", label: "ES", name: "Español" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "ja", label: "JA", name: "日本語" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const changeLang = (lng: string) => {
    if (i18n.language !== lng) {
      setPreferredLanguage(lng as any);
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const current =
    LANG_OPTIONS.find((opt) => opt.code === i18n.language) || LANG_OPTIONS[0];

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        type="button"
        className="lang-chip"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current?.label || (i18n.language || "EN").slice(0, 2).toUpperCase()}
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LANG_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              role="menuitemradio"
              aria-checked={option.code === i18n.language}
              className={`lang-menu-item${
                option.code === i18n.language ? " active" : ""
              }`}
              onClick={() => changeLang(option.code)}
            >
              <span className="lang-menu-label">{option.label}</span>
              <span className="lang-menu-name">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
