import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const donationButtonIds = [
  import.meta.env.VITE_PAYPAL_BUTTON_ID,
  import.meta.env.VITE_PAYPAL_SANDBOX_BUTTON_ID,
].filter(Boolean);

const plusButtonIds = [
  import.meta.env.VITE_PAYPAL_PLUS_BUTTON_ID,
  import.meta.env.VITE_PAYPAL_SANDBOX_PLUS_BUTTON_ID,
].filter(Boolean);

export default function PayPalReturnRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostedButtonId = (params.get("hosted_button_id") || params.get("button_id") || "").trim();
    const customIntent = (params.get("custom") || params.get("intent") || params.get("plan") || "").trim().toLowerCase();

    const targetsDonation =
      donationButtonIds.includes(hostedButtonId) ||
      customIntent === "donation" ||
      customIntent === "support";
    const targetsPlus =
      plusButtonIds.includes(hostedButtonId) ||
      customIntent === "aurora_plus" ||
      customIntent === "plus";

    if (targetsPlus) {
      const suffix = params.toString();
      navigate(`/aurora-plus/thanks${suffix ? `?${suffix}` : ""}`, { replace: true });
      return;
    }

    params.set("donation", "success");
    const suffix = params.toString();
    navigate(`/invest${suffix ? `?${suffix}` : ""}`, { replace: true });
  }, [navigate]);

  return null;
}
