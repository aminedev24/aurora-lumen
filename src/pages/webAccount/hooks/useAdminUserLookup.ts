import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  adminLookupWebAccountUser,
  type AdminAppUser,
  type AdminUserResponse,
  type AdminWebAccountUser,
  useWebAuth,
} from "@/lib/webAuth";

export function useAdminUserLookup() {
  const { user: webAuthUser } = useWebAuth();
  const [searchParams] = useSearchParams();
  const [adminEmail, setAdminEmail] = useState(webAuthUser?.email ?? "");
  const [adminTarget, setAdminTarget] = useState<AdminWebAccountUser | null>(null);
  const [adminAppUser, setAdminAppUser] = useState<AdminAppUser | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [adminEditFields, setAdminEditFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const autoLookupTriggered = useRef(false);

  // Auto-lookup user from URL parameter (e.g., ?adminEmail=user@example.com)
  useEffect(() => {
    const emailFromUrl = searchParams.get("adminEmail");
    if (emailFromUrl && !autoLookupTriggered.current) {
      autoLookupTriggered.current = true;
      setAdminEmail(emailFromUrl);
      return; // Don't set to webAuthUser email if we have URL param
    }
    // Only set to logged-in user's email if no URL parameter
    if (webAuthUser?.email && !emailFromUrl) {
      setAdminEmail(webAuthUser.email);
    }
  }, [webAuthUser?.email, searchParams]);

  const resetFeedback = useCallback(() => {
    setAdminMessage(null);
    setAdminError(null);
  }, []);

  const applyResponse = useCallback((payload: AdminUserResponse) => {
    setAdminTarget(payload.user);
    setAdminAppUser(payload.appUser ?? null);
    const nextEmail = payload.appUser?.email || payload.user.email || "";
    setAdminEmail(nextEmail);
    setSelectedEmail(nextEmail ? nextEmail.trim().toLowerCase() : null);
    setAdminEditFields({
      firstName: payload.appUser?.firstName ?? "",
      lastName: payload.appUser?.lastName ?? "",
      email: nextEmail,
      phone: payload.appUser?.phone ?? "",
      password: "",
    });
  }, []);

  // Trigger auto-lookup when URL parameter is present
  useEffect(() => {
    const emailFromUrl = searchParams.get("adminEmail");
    if (emailFromUrl && autoLookupTriggered.current && adminEmail === emailFromUrl && !adminTarget) {
      // Email has been set, now trigger the lookup
      const performLookup = async () => {
        try {
          setAdminBusy(true);
          resetFeedback();
          const payload = await adminLookupWebAccountUser(emailFromUrl.trim());
          applyResponse(payload);
          setAdminMessage("User loaded from URL parameter.");
        } catch (err: any) {
          console.error("[web-account] auto-lookup failed", err);
          setAdminError(typeof err?.message === "string" ? err.message : "Unable to load that user.");
        } finally {
          setAdminBusy(false);
        }
      };
      performLookup();
    }
  }, [adminEmail, adminTarget, searchParams, applyResponse, resetFeedback]);

  const handleLookup = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!adminEmail.trim()) {
        setAdminError("Enter an email address to look up.");
        setAdminTarget(null);
        setAdminAppUser(null);
        setSelectedEmail(null);
        return;
      }
      setAdminBusy(true);
      resetFeedback();
      try {
        const payload = await adminLookupWebAccountUser(adminEmail.trim());
        applyResponse(payload);
        setAdminMessage("User loaded.");
      } catch (err: any) {
        console.error("[web-account] admin lookup failed", err);
        setAdminTarget(null);
        setAdminAppUser(null);
        setSelectedEmail(null);
        setAdminError(typeof err?.message === "string" ? err.message : "Unable to load that user.");
      } finally {
        setAdminBusy(false);
      }
    },
    [adminEmail, applyResponse, resetFeedback]
  );

  const handleAdminEmailChange = useCallback(
    (value: string) => {
      setAdminEmail(value);
      const normalized = value.trim().toLowerCase();
      if (selectedEmail && normalized !== selectedEmail) {
        setSelectedEmail(null);
        setAdminTarget(null);
        setAdminAppUser(null);
      }
    },
    [selectedEmail]
  );

  const requireTarget = useCallback(() => {
    if (!selectedEmail) {
      setAdminError("Load a user first.");
      return false;
    }
    return true;
  }, [selectedEmail]);

  return {
    adminEmail,
    adminTarget,
    adminAppUser,
    selectedEmail,
    adminEditFields,
    adminBusy,
    adminError,
    adminMessage,
    setAdminEditFields,
    setAdminError,
    setAdminMessage,
    setAdminBusy,
    resetFeedback,
    applyResponse,
    handleLookup,
    handleAdminEmailChange,
    requireTarget,
  };
}
