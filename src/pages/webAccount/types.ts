export type EditableFields = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
};

export type TrialSummary = {
  headline: string;
  detail: string;
  tone: "success" | "warning" | "muted";
  status: "none" | "active" | "ended";
};
