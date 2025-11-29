import React from "react";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import type { TrialSummary } from "@/pages/webAccount/types";
import type { PlanDescriptor } from "../types";

type PlanPanelProps = {
  t: TFunction<"app">;
  plan: PlanDescriptor;
  trialSummary: TrialSummary;
  showUpgradeCta: boolean;
  upgradeHref: string;
};

export function PlanPanel({
  t,
  plan,
  trialSummary,
  showUpgradeCta,
  upgradeHref,
}: PlanPanelProps) {
  return (
    <article className="account-panel account-panel--plan">
      <div className="account-panel-header" style={{ alignItems: "flex-start" }}>
        <div>
          <h3 className="account-panel-title">
            {t("accountPage.plan.title", "Subscription tier")}
          </h3>
          <p className="account-panel-subtext">
            {t(
              "accountPage.plan.copy",
              "Your current Aurora access level and perks."
            )}
          </p>
        </div>
        <span className="admin-pill">
          {plan.key === "plus"
            ? t("accountPage.plan.plusLabel", "Aurora Plus")
            : plan.key === "standard"
            ? t("accountPage.plan.standardLabel", "Standard")
            : t("accountPage.plan.freeLabel", "Free")}
        </span>
      </div>
      <div className="account-panel-body">
        <h4>{plan.title}</h4>
        <p>{plan.description}</p>
        <ul>
          {plan.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        {trialSummary.status !== "none" && (
          <div
            className={`admin-alert ${
              trialSummary.tone === "warning"
                ? "warning"
                : trialSummary.tone === "success"
                ? "success"
                : ""
            }`}
            role="status"
          >
            <strong>{trialSummary.headline}</strong>
            <div>{trialSummary.detail}</div>
          </div>
        )}
        {showUpgradeCta && (
          <Link to={upgradeHref} className="btn btn--outline">
            {t("accountPage.plan.requestUpgrade", "Request Aurora Plus")}
          </Link>
        )}
      </div>
    </article>
  );
}
