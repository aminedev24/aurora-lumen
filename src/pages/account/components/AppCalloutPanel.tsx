import React from "react";
import type { TFunction } from "i18next";

type AppCalloutPanelProps = {
  t: TFunction<"app">;
  bullets: string[];
};

export function AppCalloutPanel({ t, bullets }: AppCalloutPanelProps) {
  return (
    <article className="account-panel account-panel--aurora">
      <h3 className="account-panel-title">
        {t("accountPage.focus.appTitle", "Customize Aurora in the App")}
      </h3>
      <div className="account-panel-body">
        <p>
          {t(
            "accountPage.focus.appCopy",
            "Head to the Aurora App whenever you want to personalise how Aurora looks and responds."
          )}
        </p>
        <ul>
          {bullets.map((item, idx) => (
            <li key={`app-${idx}`}>{item}</li>
          ))}
        </ul>
        <p>
          {t(
            "accountPage.focus.appReminder",
            "Launch the Aurora App to edit persona, themes, notes, and other advanced settings."
          )}
        </p>
      </div>
    </article>
  );
}
