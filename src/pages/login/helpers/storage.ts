const LAST_WEB_EMAIL_KEY = "aurora_web_last_email";
const REMEMBER_WEB_EMAIL_KEY = "aurora_web_remember_email";
const WEB_PASSWORD_PREF_KEY = "aurora_web_password_enabled";

export function readPasswordPreference(): boolean {
  try {
    return window.localStorage.getItem(WEB_PASSWORD_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePasswordPreference(enabled: boolean) {
  try {
    if (enabled) {
      window.localStorage.setItem(WEB_PASSWORD_PREF_KEY, "1");
    } else {
      window.localStorage.removeItem(WEB_PASSWORD_PREF_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadRememberEmailFlag(): boolean {
  try {
    const stored = window.localStorage.getItem(REMEMBER_WEB_EMAIL_KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
  } catch {
    // ignore
  }
  return true;
}

export function persistRememberEmailFlag(value: boolean) {
  try {
    window.localStorage.setItem(REMEMBER_WEB_EMAIL_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export function loadLastEmail(): string | null {
  try {
    return window.localStorage.getItem(LAST_WEB_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function storeLastEmail(value?: string | null) {
  try {
    if (value) {
      window.localStorage.setItem(LAST_WEB_EMAIL_KEY, value);
    } else {
      window.localStorage.removeItem(LAST_WEB_EMAIL_KEY);
    }
  } catch {
    // ignore
  }
}
