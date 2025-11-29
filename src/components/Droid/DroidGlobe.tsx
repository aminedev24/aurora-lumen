import React from "react";

type Props = {
  locale?: string;
  script?: string[];
  languageLines?: string[];
  interactionClearKey?: number;
};

export default function DroidGlobe({ locale, script, languageLines }: Props) {
  return (
    <div className="droid-globe-placeholder">
      <div className="droid-globe-circle" />
      <div className="droid-globe-copy">
        <div>Locale: {locale || "auto"}</div>
        <div>Script lines: {script?.length ?? 0}</div>
        <div>Language lines: {languageLines?.length ?? 0}</div>
      </div>
    </div>
  );
}
