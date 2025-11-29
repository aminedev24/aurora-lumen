import React, { useEffect, useState } from "react";
import {
  adminExitImpersonation,
  finalizeImpersonationExit,
  getImpersonationMeta,
  performWebLogout,
} from "@/lib/webAuth";
import "./ImpersonationBanner.css";

export function ImpersonationBanner() {
  const [impersonationData, setImpersonationData] = useState<{
    adminEmail: string;
    expiresAt: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setImpersonationData(getImpersonationMeta());
    update();

    const interval = window.setInterval(update, 1000);
    const handler = () => update();
    window.addEventListener("web-impersonation-change", handler);
    return () => {
      window.removeEventListener("web-impersonation-change", handler);
      window.clearInterval(interval);
    };
  }, []);

  const handleExitImpersonation = async () => {
    try {
      await adminExitImpersonation();
    } catch (err: any) {
      console.error("[impersonation] exit failed", err);
      alert("Failed to exit impersonation: " + (err?.message || "Unknown error"));
      return;
    }

    const restored = finalizeImpersonationExit();
    if (restored) {
      window.location.href = "/web-account";
      return;
    }

    await performWebLogout();
    window.location.href = "/";
  };

  if (!impersonationData) {
    return null;
  }

  return (
    <div className="impersonation-banner">
      <div className="impersonation-banner-content">
        <span className="impersonation-icon">🗝️</span>
        <span className="impersonation-text">
          <strong>Impersonation Mode:</strong> You are viewing this account as admin ({impersonationData.adminEmail})
        </span>
        <button
          type="button"
          className="impersonation-exit-btn"
          onClick={handleExitImpersonation}
          title="Exit impersonation and return to admin account"
        >
          Exit Impersonation
        </button>
      </div>
    </div>
  );
}
