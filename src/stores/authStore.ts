export type WebUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
};

type AuthState = {
  user: WebUser | null;
  token: string | null;
  setUser: (user: WebUser | null, token?: string | null, _sessionId?: string | null) => void;
};

const store: AuthState = {
  user: null,
  token: null,
  setUser: (user, token) => {
    store.user = user;
    store.token = token ?? null;
  },
};

export function useAuthStore<T = AuthState>(selector?: (state: AuthState) => T): T {
  return selector ? selector(store) : ((store as unknown) as T);
}
