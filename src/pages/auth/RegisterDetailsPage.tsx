// ==============================================================================
// File: /frontend/src/pages/RegisterDetailsPage.tsx
// Description: Step 2 profile form (handles username, name, date, email, password confirmation)
// ==============================================================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Copy, CheckSquare, Square } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { register } from "@/lib/api";
import "@/pages/home/HomePage.css";
import TopBar from "@/pages/TopBar";

type Step1State = { email?: string; password?: string } | null;

// Helper functions
function sanitizeBase(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "").replace(/^_+|_+$/g, "");
}

function genFromEmail(email: string) {
  const local = (email.split("@")[0] || "").trim();
  let base = sanitizeBase(local) || "user";
  if (base.length < 3) base = base.padEnd(3, "x");
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${base}${suffix}`;
}

export default function RegisterDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();

  const step1 = useMemo<Step1State>(() => {
    const st = (location.state as Step1State) || null;
    if (st?.email || st?.password) return st;
    try {
      const raw = sessionStorage.getItem("REG_STEP1");
      return raw ? (JSON.parse(raw) as Step1State) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const [username, setUsername] = useState("");
  const [autoUser, setAutoUser] = useState(true);
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState(step1?.email || "");
  const [password, setPassword] = useState(step1?.password || "");
  const [confirm, setConfirm] = useState(step1?.password || "");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const retriedOnceRef = useRef(false);
  const autoLabel = t("auth.autoUsername", "Auto");
  const manualLabel = t("auth.manualUsername", "Manual");

  // Auto-generate username on mount or when email changes
  useEffect(() => {
    if (autoUser && !username && email) {
      setUsername(genFromEmail(email));
    }
  }, [autoUser, username, email]);

  // Cleanup session storage on unmount
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem("REG_STEP1");
      } catch {}
    };
  }, []);

  async function doRegister(finalUsername: string) {
    const data = await register({
      username: finalUsername,
      last_name: name.trim(),
      first_name: firstName.trim(),
      date_of_birth: dob.trim(),
      email: email.trim(),
      password,
      account_type: "Free",
    });
    return data;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!name.trim() || !firstName.trim()) {
      setError("All required fields must be filled.");
      return;
    }

    let finalUsername = autoUser
      ? sanitizeBase(username || genFromEmail(email))
      : sanitizeBase(username);

    if (!finalUsername || finalUsername.length < 3) {
      finalUsername = genFromEmail(email);
      setUsername(finalUsername);
    }

    try {
      setLoading(true);
      const data = await doRegister(finalUsername);

      if (data?.user && data?.access_token) {
        setUser(data.user, data.access_token, data.session?.session_id);
        localStorage.setItem("aurora_token", data.access_token);
        try {
          sessionStorage.removeItem("REG_STEP1");
        } catch {}
        navigate("/chat/account", { replace: true });
        return;
      } else {
        throw new Error("Registration failed.");
      }
    } catch (err: any) {
      const msg = String(err?.message || "");
      let suggestions: string[] | null = null;
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.suggestions?.length) suggestions = parsed.suggestions;
      } catch {}

      const alreadyExists =
        msg.includes("Username already exists") || (suggestions && suggestions.length > 0);

      if (autoUser && alreadyExists && !retriedOnceRef.current) {
        retriedOnceRef.current = true;
        const next = suggestions?.[0] || genFromEmail(email);
        setUsername(next);

        try {
          const data = await doRegister(next);
          if (data?.user && data?.access_token) {
            setUser(data.user, data.access_token, data.session?.session_id);
            localStorage.setItem("aurora_token", data.access_token);
            sessionStorage.removeItem("REG_STEP1");
            navigate("/chat/account", { replace: true });
            return;
          }
        } catch (e2: any) {
          setError(e2?.message || "Registration failed.");
          return;
        }
      }

      if (/Email already registered|Phone already registered/i.test(msg)) {
        setError("This account already exists. Please sign in instead.");
      } else {
        setError(msg || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing register-details-page">
      <TopBar />
      <div className="register-layout">
        <section className="register-hero">
          <div className="register-hero-inner">
            <h1>{t("auth.register", "Create Account")}</h1>
            <p>
              {t("auth.registerIntro", "Sign up is free. Unlock Aurora Lumen with your account.")}
            </p>
          </div>
        </section>

        <section className="register-panel" aria-label={t("auth.registerDetails", "Complete your profile details")}>
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="register-error">{error}</div>}

            <div className="register-field duo">
              <div className="register-field-control">
                <label htmlFor="username">Username (unique)</label>
                <input
                  id="username"
                  className="register-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading || autoUser}
                  placeholder="your_name"
                />
              </div>
              <button
                type="button"
                onClick={() => setAutoUser((v) => !v)}
                className={`register-toggle ${autoUser ? "active" : ""}`}
                title="Auto-generate username"
                disabled={loading}
              >
                {autoUser ? <CheckSquare size={18} strokeWidth={1.6} /> : <Square size={18} strokeWidth={1.6} />}
                <span className="register-toggle-label">{autoUser ? autoLabel : manualLabel}</span>
              </button>
            </div>

            <div className="register-grid">
              <label className="register-field">
                <span>Name</span>
                <input
                  id="lastname"
                  className="register-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
              <label className="register-field">
                <span>First Name</span>
                <input
                  id="firstname"
                  className="register-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
              <label className="register-field">
                <span>Date of Birth (optional)</span>
                <input
                  id="dob"
                  type="date"
                  className="register-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={loading}
                />
              </label>
              <label className="register-field">
                <span>Email</span>
                <input
                  id="email"
                  type="email"
                  className={`register-input ${step1?.email ? "readonly" : ""}`.trim()}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (autoUser) setUsername("");
                  }}
                  required
                  readOnly={!!step1?.email}
                  disabled={loading}
                />
              </label>
            </div>

            <div className="register-field">
              <label className="register-field-label" htmlFor="password">Password</label>
              <div className="register-password-row">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className={`register-input ${step1?.password ? "readonly" : ""}`.trim()}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  readOnly={!!step1?.password}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="register-icon-btn"
                  onClick={() => setShowPass((v) => !v)}
                  title={showPass ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPass ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(password)}
                  className="register-icon-btn"
                  title="Copy password"
                  disabled={loading || !password}
                >
                  <Copy size={18} strokeWidth={1.6} />
                </button>
              </div>
            </div>

            <label className="register-field">
              <span>Confirm Password</span>
              <input
                id="confirm"
                type="password"
                className="register-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </label>

            <button type="submit" disabled={loading} className="register-submit">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
