import React from "react";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";

type GuestCardProps = {
  t: TFunction<"app">;
};

export function GuestCard({ t }: GuestCardProps) {
  return (
    <div className="account-guest">
      <h2>{t("settings.guestTitle", "Guest User")}</h2>
      <p>
        {t("settings.guestText", "Sign in to review your identity details and start data requests.")}
      </p>
      <p className="account-sub">
        {t(
          "settings.guestSubtext",
          "AI persona, skin, and workspace personalization live inside the Aurora App."
        )}
      </p>
      <div className="account-btn-row">
        <Link to="/login?mode=login" className="btn btn--primary">
          {t("auth.login", "Sign in")}
        </Link>
        <Link to="/login?mode=register" className="btn btn--outline">
          {t("auth.register", "Register")}
        </Link>
      </div>
    </div>
  );
}
