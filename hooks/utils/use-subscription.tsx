import { SubscriptionValidateResponse } from "@/@backend-types/Subscription";
import { useCustomLocalStorage } from "./use-custom-local-storage";

const SUBSCRIPTION_STORAGE_KEY = "subscription";

export function useSubscription() {
  const [subscription, setSubscription, removeSubscription] =
    useCustomLocalStorage<SubscriptionValidateResponse>(
      SUBSCRIPTION_STORAGE_KEY,
      {
        status: "past_due",
        expires_at: "",
        trial_end_date: "",
        plan_name: "",
        plan_description: "",
        plan_price: "",
        features: null,
        billing_cycle: "",
      },
    );

  return {
    subscription,
    setSubscription,
    removeSubscription,
  };
}
