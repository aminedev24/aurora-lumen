import React from "react";
import type { TFunction } from "i18next";
import type { RequestWebLoginInfo } from "@/lib/webAuth";

export function buildVerificationBanner(t: TFunction<"translation", undefined>, info: RequestWebLoginInfo | null) {
  if (!info) return null;
  const verified = Boolean(info.email_verified);
  const trial = info.trial || {};
  const trialBlocked = Boolean(info.trial_blocked_by_ip);
  const trialMessage = trial.active
    ? t("auth.web.bannerTrialActive", "Standard trial active ({{days}} days left).", {
        days: trial.days_remaining ?? 7,
      })
    : trial.consumed
    ? t("auth.web.bannerTrialDone", "Trial completed — you now stay on the Standard plan with daily caps.")
    : null;

  return (
    <div className={`login-status ${verified ? "is-verified" : "is-pending"}`}>
      <strong>
        {verified
          ? t("auth.web.bannerVerified", "Email confirmed — choose password or code.")
          : t("auth.web.bannerPending", "Email confirmation required — we sent a link and a 6-digit code.")}
      </strong>
      <p>
        {verified
          ? t(
              "auth.web.bannerVerifiedBody",
              "Use the password tab for quick access or continue with the secure 6-digit code."
            )
          : t(
              "auth.web.bannerPendingBody",
              "Open the magic link for one-click sign-in or enter the code below to finish confirming."
            )}
      </p>
      {trialMessage && <p className="login-status-note">{trialMessage}</p>}
      {trialBlocked && (
        <p className="login-status-note">
          {t(
            "auth.web.bannerTrialBlocked",
            "This network already used a Standard trial, so no extra trials can start here."
          )}
        </p>
      )}
    </div>
  );
}
