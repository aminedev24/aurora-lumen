import { useCallback, useState } from "react";
import {
  adminAssignWebRole,
  adminGrantWebPlusAccess,
  adminRemoveWebRole,
  adminRevokeWebPlusAccess,
  adminUpdateWebUserProfile,
  adminUpdateWebUserStatus,
  type AdminUserResponse,
} from "@/lib/webAuth";

type AdminEditFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type UseAdminActionsProps = {
  selectedEmail: string | null;
  adminEmail: string;
  adminEditFields: AdminEditFields;
  isOwner: boolean;
  setAdminBusy: (busy: boolean) => void;
  setAdminError: (error: string | null) => void;
  setAdminMessage: (message: string | null) => void;
  applyResponse: (payload: AdminUserResponse) => void;
};

export function useAdminActions({
  selectedEmail,
  adminEmail,
  adminEditFields,
  isOwner,
  setAdminBusy,
  setAdminError,
  setAdminMessage,
  applyResponse,
}: UseAdminActionsProps) {
  const [adminReason, setAdminReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [adminStatusReason, setAdminStatusReason] = useState("");

  const resetFeedback = useCallback(() => {
    setAdminMessage(null);
    setAdminError(null);
  }, [setAdminMessage, setAdminError]);

  const requireTarget = useCallback(() => {
    if (!selectedEmail) {
      setAdminError("Load a user first.");
      return false;
    }
    return true;
  }, [selectedEmail, setAdminError]);

  const handleGrantPlus = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminGrantWebPlusAccess({
        email: targetEmail,
        reason: adminReason.trim() || undefined,
        supportNote: adminNote.trim() || undefined,
      });
      applyResponse(payload);
      setAdminMessage("Aurora Plus access granted.");
    } catch (err: any) {
      console.error("[web-account] grant plus failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to grant Aurora Plus.");
    } finally {
      setAdminBusy(false);
    }
  }, [selectedEmail, adminReason, adminNote, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]);

  const handleRevokePlus = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminRevokeWebPlusAccess({
        email: targetEmail,
        reason: adminReason.trim() || undefined,
        supportNote: adminNote.trim() || undefined,
      });
      applyResponse(payload);
      setAdminMessage("Aurora Plus access revoked.");
    } catch (err: any) {
      console.error("[web-account] revoke plus failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to revoke Aurora Plus.");
    } finally {
      setAdminBusy(false);
    }
  }, [selectedEmail, adminReason, adminNote, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]);

  const handlePromote = useCallback(async () => {
    if (!isOwner) {
      setAdminError("Only the owner can grant admin roles.");
      return;
    }
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminAssignWebRole(targetEmail);
      applyResponse(payload);
      setAdminMessage("Admin role granted.");
    } catch (err: any) {
      console.error("[web-account] assign admin failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to grant admin role.");
    } finally {
      setAdminBusy(false);
    }
  }, [selectedEmail, isOwner, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]);

  const handleDemote = useCallback(async () => {
    if (!isOwner) {
      setAdminError("Only the owner can remove admin roles.");
      return;
    }
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminRemoveWebRole(targetEmail);
      applyResponse(payload);
      setAdminMessage("Admin role removed.");
    } catch (err: any) {
      console.error("[web-account] remove admin failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to remove admin role.");
    } finally {
      setAdminBusy(false);
    }
  }, [selectedEmail, isOwner, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]);

  const handleStatus = useCallback(
    async (action: "lock" | "unlock" | "ban" | "reactivate") => {
      resetFeedback();
      if (!requireTarget()) return;
      setAdminBusy(true);
      try {
        const targetEmail = selectedEmail as string;
        const payload = await adminUpdateWebUserStatus({
          email: targetEmail,
          action,
          reason: adminStatusReason.trim() || undefined,
        });
        applyResponse(payload);
        setAdminMessage(
          action === "reactivate"
            ? "User reactivated."
            : action === "unlock"
            ? "Account unlocked."
            : action === "ban"
            ? "User banned."
            : "Account locked."
        );
      } catch (err: any) {
        console.error("[web-account] status update failed", err);
        setAdminError(typeof err?.message === "string" ? err.message : "Unable to update user status.");
      } finally {
        setAdminBusy(false);
      }
    },
    [selectedEmail, adminStatusReason, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]
  );

  const handleProfileSave = useCallback(async () => {
    resetFeedback();
    if (!requireTarget()) return;
    setAdminBusy(true);
    try {
      const targetEmail = selectedEmail as string;
      const payload = await adminUpdateWebUserProfile({
        email: targetEmail,
        firstName: adminEditFields.firstName,
        lastName: adminEditFields.lastName,
        phone: adminEditFields.phone,
        newEmail: adminEditFields.email && adminEditFields.email !== adminEmail ? adminEditFields.email : undefined,
        password: adminEditFields.password.trim() ? adminEditFields.password : undefined,
      });
      applyResponse(payload);
      setAdminMessage("Profile updated.");
    } catch (err: any) {
      console.error("[web-account] admin profile update failed", err);
      setAdminError(typeof err?.message === "string" ? err.message : "Unable to update profile.");
    } finally {
      setAdminBusy(false);
    }
  }, [selectedEmail, adminEmail, adminEditFields, resetFeedback, applyResponse, requireTarget, setAdminBusy, setAdminError, setAdminMessage]);

  return {
    adminReason,
    adminNote,
    adminStatusReason,
    setAdminReason,
    setAdminNote,
    setAdminStatusReason,
    handleGrantPlus,
    handleRevokePlus,
    handlePromote,
    handleDemote,
    handleStatus,
    handleProfileSave,
  };
}
