import { useEffect } from "react";
import { useGetSubscription } from "@/hooks/integration/subscription/queries";
import { useSubscription } from "./use-subscription";

export function useValidateSubscription() {
  const { data, isLoading, error } = useGetSubscription();
  const { setSubscription } = useSubscription();

  useEffect(() => {
    if (data) {
      setSubscription(data);
    }
  }, [data, setSubscription]);

  return {
    isLoading,
    hasError: !!error,
    isExpired: !isLoading && !error && data?.status !== "active",
    shouldBlock: !isLoading && (!!error || data?.status !== "active"),
  };
}
