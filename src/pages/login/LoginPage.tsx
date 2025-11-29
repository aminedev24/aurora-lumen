// ==============================================================================
// File: /frontend/src/pages/LoginPage.tsx
// Description: Thin wrapper around login flow + panel components
// ==============================================================================

import React from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/pages/TopBar";
import Footer from "@/pages/Footer";
import "@/pages/home/HomePage.css";
import "@/pages/auth/login.css";
import { useLoginFlow } from "./useLoginFlow";
import { LoginPanel } from "./LoginPanel";

export default function LoginPage() {
  const { t } = useTranslation();

  const flow = useLoginFlow({ t });

  return (
    <div className="landing login-page">
      <TopBar />
      <div className="login-layout">
        <LoginPanel t={t} flow={flow} />
      </div>
      <Footer />
    </div>
  );
}
