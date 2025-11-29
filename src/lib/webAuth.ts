import { useMemo } from "react";

export type WebUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
  is_owner?: boolean;
  is_admin?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
};

export type RequestWebLoginInfo = {
  email: string;
  flow?: "login" | "register" | string;
  session_id?: string | null;
};

export type AdminWebAccountUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string;
  username?: string;
  status?: string;
  role?: string;
  roles?: string[];
  is_owner?: boolean;
  isOwner?: boolean;
  is_admin?: boolean;
  isAdmin?: boolean;
  lockedAt?: string | null;
  lockedReason?: string | null;
  bannedAt?: string | null;
  bannedReason?: string | null;
  deletedAt?: string | null;
  plan?: string;
  plusAccess?: boolean;
};

export type AdminAppUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountType?: string;
};

export type AdminUserResponse = {
  user: AdminWebAccountUser;
  appUser?: AdminAppUser | null;
  session?: { session_id?: string | null } | null;
};

export type AdminUserSummary = {
  email: string;
  country?: string;
  ip?: string;
  role?: string;
  plan?: string;
  createdAt?: string;
};

export type AdminUserListSort = "email" | "country" | "ip" | "createdAt" | "plan";

const demoUser: WebUser = {
  id: "demo-user",
  email: "demo@example.com",
  name: "Demo User",
  role: "user",
  roles: ["user"],
};

export function useWebAuth() {
  return useMemo(
    () => ({
      isAuthenticated: Boolean(currentSnapshot.user),
      user: currentSnapshot.user,
      expiresAt: currentSnapshot.expiresAt,
    }),
    [currentSnapshot.user, currentSnapshot.expiresAt]
  );
}

export async function performWebLogout() {
  return;
}

export async function revokeOtherWebSessions() {
  return;
}

export async function adminSendMailTemplate() {
  return { message: "queued" };
}

let currentSnapshot: { user: WebUser | null; token: string | null; expiresAt: string | null } = {
  user: null,
  token: null,
  expiresAt: null,
};

export function getWebAuthSnapshot() {
  return currentSnapshot;
}

export function storeImpersonationBackup(snapshot: typeof currentSnapshot) {
  try {
    localStorage.setItem("web_impersonation_backup", JSON.stringify(snapshot));
  } catch {}
}

export function getImpersonationMeta() {
  try {
    const raw = localStorage.getItem("web_impersonation_pending");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      adminEmail: parsed.adminEmail || "admin@example.com",
      expiresAt: parsed.expiresAtMs || Date.now() + 5 * 60 * 1000,
    };
  } catch {
    return null;
  }
}

export async function adminExitImpersonation() {
  try {
    localStorage.setItem("web_impersonation_exit", "1");
  } catch {}
}

export function finalizeImpersonationExit() {
  try {
    const raw = localStorage.getItem("web_impersonation_backup");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    currentSnapshot = {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      expiresAt: parsed.expiresAt ?? null,
    };
    localStorage.removeItem("web_impersonation_backup");
    localStorage.removeItem("web_impersonation_pending");
    localStorage.removeItem("web_impersonation_exit");
    return parsed;
  } catch {
    return null;
  }
}

export async function adminLookupWebAccountUser(email: string): Promise<AdminUserResponse> {
  const normalizedEmail = email || demoUser.email || "user@example.com";
  return {
    user: {
      email: normalizedEmail,
      name: "Sample User",
      role: "user",
      roles: ["user"],
    },
    appUser: {
      email: normalizedEmail,
      firstName: "Sample",
      lastName: "User",
      phone: "",
    },
    session: { session_id: "session-demo" },
  };
}

export async function adminGrantWebPlusAccess(_payload: any): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("plus-user@example.com");
}

export async function adminRevokeWebPlusAccess(_payload: any): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("revoked-user@example.com");
}

export async function adminAssignWebRole(_email: string): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("admin@example.com");
}

export async function adminRemoveWebRole(_email: string): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("user@example.com");
}

export async function adminUpdateWebUserStatus(_payload: any): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("status-user@example.com");
}

export async function adminUpdateWebUserProfile(_payload: any): Promise<AdminUserResponse> {
  return adminLookupWebAccountUser("profile-user@example.com");
}

export async function adminListWebUsers(_filters: {
  search?: string;
  ip?: string;
  country?: string;
  sort?: AdminUserListSort;
  direction?: "asc" | "desc";
}): Promise<{ items: AdminUserSummary[] }> {
  return {
    items: [
      {
        email: "user@example.com",
        country: "US",
        ip: "127.0.0.1",
        role: "user",
        plan: "standard",
        createdAt: new Date().toISOString(),
      },
      {
        email: "plus@example.com",
        country: "DE",
        ip: "10.0.0.5",
        role: "admin",
        plan: "plus",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
}

export async function adminImpersonateUser(email: string): Promise<{
  access_token: string;
  admin_email: string;
  target_user: string;
  expires_in: number;
}> {
  try {
    localStorage.setItem(
      "web_impersonation_pending",
      JSON.stringify({
        adminEmail: demoUser.email,
        expiresAtMs: Date.now() + 15 * 60 * 1000,
        targetUser: email,
      })
    );
  } catch {}
  return {
    access_token: "impersonation-token",
    admin_email: demoUser.email || "admin@example.com",
    target_user: email,
    expires_in: 900,
  };
}

export async function adminSendMail(_payload: any) {
  return { message: "sent" };
}

export async function requestWebLoginCode(payload: {
  email: string;
  name?: string;
  flow?: string;
}): Promise<RequestWebLoginInfo> {
  return { email: payload.email, flow: (payload.flow as any) || "login", session_id: "session-demo" };
}

export async function verifyWebLoginCode(_code: string): Promise<{ access_token: string; user: WebUser }> {
  return { access_token: "verify-token", user: demoUser };
}

export async function loginWebWithPassword(email: string, _password: string) {
  return {
    access_token: "password-token",
    user: { ...demoUser, email },
    session: { session_id: "session-demo" },
  };
}

export async function setWebPassword(_payload: { session_id: string; email: string; password: string }) {
  return { success: true };
}

export async function fetchWebProfile() {
  return demoUser;
}

export function applyVerifiedSession<T extends { user?: WebUser | null; access_token?: string | null }>(payload: T) {
  return payload;
}

export function updateStoredWebUser(_user: WebUser | null) {
  return;
}

export async function confirmEmailToken(token: string): Promise<{ email: string }> {
  return { email: `confirmed+${token}@example.com` };
}
