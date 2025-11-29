export type IdentityFields = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
};

export type PlanKey = "free" | "standard" | "plus";

export type PlanDescriptor = {
  key: PlanKey;
  title: string;
  description: string;
  bullets: string[];
};
