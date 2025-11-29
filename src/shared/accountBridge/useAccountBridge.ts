export type BridgeProfile = {
  name: string;
  firstName: string;
  email: string;
  phone?: string;
};

export type TrialSummary = {
  status?: string;
  expiresAt?: string | null;
};

export function useAccountBridge() {
  const profile: BridgeProfile = {
    name: "Demo User",
    firstName: "Demo",
    email: "demo@example.com",
    phone: "",
  };

  return {
    loading: false,
    error: null as string | null,
    profile,
    planKey: "standard",
    trialSummary: { status: "none" } as TrialSummary,
    sessionExpiresAt: null as string | null,
    verification: null as any,
    refresh: async () => {},
    updateProfile: async (_payload: any) => profile,
    updatePassword: async (_password: string) => ({ success: true }),
  };
}
