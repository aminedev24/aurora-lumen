import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminUserListSort,
  AdminUserSummary,
  adminListWebUsers,
  adminImpersonateUser,
  useWebAuth,
  getWebAuthSnapshot,
  storeImpersonationBackup,
} from "@/lib/webAuth";
import { useAuthStore } from "@/stores/authStore";
import "./AdminDashboard.css";

type AdminUsersPanelProps = {
  title?: string;
  description?: string;
  variant?: "dashboard" | "embedded";
};

export function AdminUsersPanel({
  title = "Users Management",
  description = "Browse every Aurora account, filter by country or IP, and jump into detailed controls.",
  variant = "dashboard",
}: AdminUsersPanelProps) {
  const { user: appUser, isLoggedIn } = useAuthStore();
  const { user: webUser } = useWebAuth();
  const [userSummaries, setUserSummaries] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState({ search: "", ip: "", country: "" });
  const [appliedFilters, setAppliedFilters] = useState({ search: "", ip: "", country: "" });
  const [sortField, setSortField] = useState<AdminUserListSort>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const webRoles = useMemo(() => {
    if (!Array.isArray(webUser?.roles)) return [];
    return webUser.roles
      .map((role) => (typeof role === "string" ? role.trim().toLowerCase() : ""))
      .filter(Boolean);
  }, [webUser?.roles]);
  const singleWebRole = typeof webUser?.role === "string" ? webUser.role.trim().toLowerCase() : "";
  const webOwnerFlag = Boolean(webUser?.is_owner || webUser?.isOwner);
  const isOwner =
    (isLoggedIn && appUser?.role === "owner") ||
    webOwnerFlag ||
    webRoles.includes("owner") ||
    singleWebRole === "owner";
  const isAdmin =
    isOwner ||
    Boolean(appUser?.role && appUser.role.toLowerCase() === "admin") ||
    webRoles.includes("admin");

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await adminListWebUsers({
        search: appliedFilters.search || undefined,
        ip: appliedFilters.ip || undefined,
        country: appliedFilters.country || undefined,
        sort: sortField,
        direction: sortDirection,
      });
      setUserSummaries(response.items);
    } catch (err: any) {
      console.error("[admin-users-panel] list users failed", err);
      setUsersError(typeof err?.message === "string" ? err.message : "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin, appliedFilters.country, appliedFilters.ip, appliedFilters.search, sortDirection, sortField]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (field: keyof typeof filterState, value: string) => {
    setFilterState((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (event?: React.FormEvent) => {
    event?.preventDefault();
    setAppliedFilters({
      search: filterState.search.trim(),
      ip: filterState.ip.trim(),
      country: filterState.country,
    });
  };

  const clearFilters = () => {
    const cleared = { search: "", ip: "", country: "" };
    setFilterState(cleared);
    setAppliedFilters(cleared);
  };

  const countries = useMemo(() => {
    const values = new Set<string>();
    userSummaries.forEach((summary) => {
      if (summary.country) {
        values.add(summary.country);
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [userSummaries]);

  const openUserInAdminPanel = useCallback(async (email: string, isTargetOwner: boolean) => {
    if (!email) return;
    if (isTargetOwner && !isOwner) {
      alert("Owner accounts cannot be accessed by non-owners.");
      return;
    }
    
    const popupWindow = window.open("about:blank", "_blank");
    const openInSameTab = !popupWindow;
    let targetWindow: Window | null = popupWindow ?? window;

    if (popupWindow) {
      try {
        popupWindow.opener = null;
        popupWindow.document.write(`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <title>Opening account…</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 2rem; color: #0f172a; }
                .spinner {
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  border: 4px solid #cbd5f5;
                  border-top-color: #2563eb;
                  animation: spin 0.8s linear infinite;
                  margin-bottom: 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <p>Loading user account…</p>
              <p>You can close this window if nothing happens.</p>
            </body>
          </html>
        `);
        popupWindow.document.close();
      } catch {
        // ignore document write errors (very restricted browsers)
      }
    }

    try {
      const adminSnapshot = getWebAuthSnapshot();
      storeImpersonationBackup(adminSnapshot);

      // Call impersonation API
      const result = await adminImpersonateUser(email);
      
      // Store the impersonation token and auth data in localStorage for the new window
      const expiresAtMs = Date.now() + result.expires_in * 1000;
      const impersonationData = {
        token: result.access_token,
        adminEmail: adminSnapshot.user?.email || result.admin_email,
        expiresAtMs,
        expiresAtIso: new Date(expiresAtMs).toISOString(),
        targetUser: result.target_user,
      };
      
      // Use a special key that will be checked on page load
      localStorage.setItem("web_impersonation_pending", JSON.stringify(impersonationData));
      
      // Open impersonated account either in the popup or fall back to this tab
      if (openInSameTab) {
        if (!window.confirm("Your browser blocked popups. Open the account in this tab instead?")) {
          localStorage.removeItem("web_impersonation_pending");
          return;
        }
      }
      targetWindow?.location.replace("/web-account");
    } catch (err: any) {
      console.error("[admin-users] impersonation failed", err);
      alert("Failed to open user account: " + (err?.message || "Unknown error"));
      try {
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }
      } catch {
        // ignore
      }
    }
  }, [isOwner]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={`admin-users-panel admin-users-panel--${variant}`}>
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="admin-card">
        <form className="admin-filters" onSubmit={applyFilters}>
          <div className="admin-filter-group">
            <label>
              Search
              <input
                type="text"
                placeholder="Name, email, plan..."
                value={filterState.search}
                onChange={(event) => handleFilterChange("search", event.target.value)}
              />
            </label>
            <label>
              IP (latest / trial)
              <input
                type="text"
                placeholder="127.0.0.1"
                value={filterState.ip}
                onChange={(event) => handleFilterChange("ip", event.target.value)}
              />
            </label>
            <label>
              Country
              <select value={filterState.country} onChange={(event) => handleFilterChange("country", event.target.value)}>
                <option value="">All countries</option>
                {countries.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-filter-group">
            <label>
              Sort by
              <select value={sortField} onChange={(event) => setSortField(event.target.value as AdminUserListSort)}>
                <option value="email">Email (A-Z)</option>
                <option value="name">Name</option>
                <option value="country">Country</option>
                <option value="plan">Plan</option>
                <option value="updated">Last updated</option>
                <option value="last_active">Last active</option>
                <option value="ip">IP</option>
              </select>
            </label>
            <label>
              Direction
              <select value={sortDirection} onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
            <div className="admin-filter-actions">
              <button type="submit" className="admin-primary-btn">
                Apply filters
              </button>
              <button type="button" className="admin-btn" onClick={clearFilters}>
                Reset
              </button>
              <button type="button" className="admin-btn" onClick={() => loadUsers()}>
                Refresh
              </button>
            </div>
          </div>
        </form>

        {usersError && <div className="admin-alert error">{usersError}</div>}

        <div className="admin-table-wrapper">
          {usersLoading ? (
            <div className="admin-loader">Loading users…</div>
          ) : userSummaries.length === 0 ? (
            <div className="admin-empty">No users match the current filters.</div>
          ) : (
            <>
              <div className="admin-table-meta">
                Showing <strong>{userSummaries.length}</strong> {userSummaries.length === 1 ? "user" : "users"}.
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Country</th>
                    <th>Last Active</th>
                    <th>IP</th>
                    <th>Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userSummaries.map((summary) => (
                    <tr key={summary.email}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-name">{summary.name || "—"}</span>
                          <span className="admin-user-email">{summary.email}</span>
                          {summary.is_owner && <span className="admin-pill">Owner</span>}
                        </div>
                      </td>
                      <td>
                        <div className="admin-plan-cell">
                          <strong>{summary.plan_effective || summary.plan || "—"}</strong>
                          {summary.app_account_type && (
                            <span className="admin-plan-detail">App: {summary.app_account_type}</span>
                          )}
                          {summary.plan_status && (
                            <span className="admin-plan-detail">Status: {summary.plan_status}</span>
                          )}
                        </div>
                      </td>
                      <td>{summary.country || "—"}</td>
                      <td>{formatDate(summary.last_active || summary.updated_at)}</td>
                      <td>
                        <div className="admin-ip-cell">
                          {summary.last_ip || summary.trial_ip || "—"}
                          {summary.trial_ip && summary.trial_ip !== summary.last_ip && (
                            <span className="admin-plan-detail">Trial: {summary.trial_ip}</span>
                          )}
                        </div>
                      </td>
                      <td>{summary.roles && summary.roles.length ? summary.roles.join(", ") : "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-primary-btn"
                          onClick={() => openUserInAdminPanel(summary.email, Boolean(summary.is_owner))}
                          disabled={Boolean(summary.is_owner) && !isOwner}
                          title={
                            Boolean(summary.is_owner) && !isOwner ? "Owner accounts cannot be accessed" : undefined
                          }
                        >
                          Open Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
