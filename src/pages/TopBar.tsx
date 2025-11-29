// ==============================================================================
// File: /frontend/src/pages/TopBar.tsx
// Description: Global top navigation with brand, primary nav, language switcher,
//              and built-in dark mode toggle (persisted in localStorage).
// - Applies persisted theme on mount across all pages (body.classList 'dark')
// - Clears leftover app themes on mount so public pages never get tiger/zebra.
// ==============================================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useWebAuth, performWebLogout } from "@/lib/webAuth";
import LanguageSwitcher from "./language/LanguageSwitcher";
import { AuroraWordmark } from "@/components/Brand/AuroraLogo";
import { AURORA_PLUS_PAYPAL_URL } from "@/lib/payments";

type TopBarProps = {
  extraActions?: React.ReactNode;
};

const THEME_KEY = "aurora_theme";
export default function TopBar({ extraActions }: TopBarProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useWebAuth();
  const location = useLocation();
  const onAccountPage = (location?.pathname || "").startsWith("/account");
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // 🧹 CLEAR APP THEMES (prevents tiger/zebra bleed)
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    const classes = Array.from(document.body.classList).filter((cls) => cls.startsWith("skin-"));
    if (classes.length) {
      document.body.classList.remove(...classes);
    }
  }, []);

  // Read persisted theme
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored === "dark") return true;
      return document.body.classList.contains("dark");
    } catch {
      return false;
    }
  });

  // Apply theme
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    try {
      window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {}
  }, [dark]);

  // Keep in sync on route change
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const wantsDark = stored === "dark";
    document.body.classList.toggle("dark", !!wantsDark);
    if (wantsDark !== dark) setDark(wantsDark);
    setNavOpen(false);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const themeToggle = useMemo(
    () => (
      <button
        type="button"
        aria-label={dark ? t("nav.toggleLight") : t("nav.toggleDark")}
        title={dark ? t("nav.toggleLight") : t("nav.toggleDark")}
        onClick={() => setDark((v) => !v)}
        className="theme-btn"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    ),
    [dark, t]
  );

  const navLinks = useMemo(
    () => [
      { to: "/chat", label: t("nav.chat") },
      { to: "/products", label: t("nav.products", "Products") },
      { to: "/experimental", label: t("nav.experimental", "Experimental") },
      { to: "/about", label: t("footer.about") },
      { to: "/help", label: t("nav.help") },
      { to: "/legal", label: t("footer.legalSafety") },
      { to: "/contact", label: t("footer.contact") },
    ],
    [t]
  );

  const profileLabel = useMemo(() => {
    const name = user?.name?.trim();
    if (name) return name.split(/\s+/)[0];
    if (user?.email) return user.email;
    return t("nav.account", "Account");
  }, [t, user?.email, user?.name]);
  const showPlusCta = false;

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await performWebLogout();
    } finally {
      setSigningOut(false);
    }
  }, [signingOut]);

  return (
    <header className="top-bar">
      <div className="page-shell top-bar-inner">
        {/* Brand */}
        <div className="top-bar-brand">
          <Link to="/" className="brand-link" aria-label={t("brand.name")}>
            <AuroraWordmark
              text={t("brand.name")}
              size={40}
              strokeWidth={3}
              outlineColor="#0a0a0a"
              textClassName="brand-text"
            />
          </Link>
        </div>

        {/* Primary Nav */}
        <nav
          aria-label="Primary"
          className={`primary-nav${navOpen ? " open" : ""}`}
          id="primary-nav"
        >
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="top-bar-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="nav-toggle"
            aria-label={t("nav.menu", "Menu")}
            aria-expanded={navOpen}
            aria-controls="primary-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
            <span>{t("nav.menu", "Menu")}</span>
          </button>
          <div className="topbar-extra">{extraActions ?? themeToggle}</div>

          {isAuthenticated ? (
            <div className="top-bar-auth">
              {!onAccountPage && (
                <Link to="/account" className="top-bar-cta profile">
                  <span>{profileLabel}</span>
                </Link>
              )}
              <button
                type="button"
                className="top-bar-cta logout"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? t("auth.signingOut", "Signing out...") : t("auth.signOut", "Sign out")}
              </button>
            </div>
          ) : (
            <div className="top-bar-auth">
              <Link to="/login" className="top-bar-cta login">
                {t("auth.signIn", "Sign in")}
              </Link>
              <Link to="/login?mode=register" className="top-bar-cta signup">
                {t("auth.signUp", "Sign up")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
