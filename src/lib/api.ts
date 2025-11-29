export const apiUrl = "/api";

export async function revokeOtherSessions() {
  return { success: true };
}

export async function resetPassword(token: string, new_password: string) {
  return { message: "Password reset (mock)", token, new_password };
}

export async function register(payload: any) {
  return { user: payload ?? {}, access_token: "register-token" };
}

export async function confirmEmailToken(_token: string) {
  return { success: true };
}

export async function adminSendMail(_payload: any) {
  return { message: "sent" };
}

export async function getGoogleConfig() {
  return { client_id: "demo-google-client-id" };
}

export async function loginWithGoogle(idToken: string) {
  return {
    access_token: "google-access-token",
    user: { id: "google-user", email: "google@example.com", name: "Google User", idToken },
    session: { session_id: "google-session" },
  };
}
